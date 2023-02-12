// 'Passkeys на Apple (Webauthn passwordless), в комбинации с сильной биометрией и Secure Enclave сделаны очень хорошо. Хранить ключи немного стремно в Keychain, но как только завезут их в 1Password можно будет переходить. Пароли/SMS это зло во всех отношениях.'
// {
//   code: 3,
//   details: 'The language ru is not supported for document_sentiment analysis.',
//   metadata: Metadata { internalRepr: Map(0) {}, options: {} },
//   note: 'Exception occurred in retry method that was not classified as transient'
// }


const rewire = require('rewire');
const chai = require('chai');
const { assert } = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('nlpCallのテスト', function() {
  this.timeout(30000);
  
  it('サポート言語の場合、感情分析結果を返す', async () => {
    
    const target = rewire('../../../convert/review/index.js');
    const analyzeSentimentStub = sinon.stub().returns(Promise.resolve({
      sentences: [ { text: [Object], sentiment: [Object] } ],
      documentSentiment: { magnitude: 0, score: 0 },
      language: 'en'
    }));
    target.__set__('analyzeSentiment', analyzeSentimentStub);
    const nlpCall = target.__get__('nlpCall');
    const input = 'aaa';
    
    const result = await nlpCall(input);
    
    assert.isNumber(result.magnitude);
    assert.isNumber(result.score);
  });
  
  it('感情分析に失敗した場合、例外が発生する', async () => {
    
    const target = rewire('../../../convert/review/index.js');
    const analyzeSentimentStub = sinon.stub().throws(new Error);
    target.__set__('analyzeSentiment', analyzeSentimentStub);
    target.__set__('NLP_WAIT_MS', 100); // テストではスリープを短く
    const nlpCall = target.__get__('nlpCall');
    const input = 'Passkeys на Apple (Webauthn passwordless), в комбинации с сильной биометрией и Secure Enclave сделаны очень хорошо. Хранить ключи немного стремно в Keychain, но как только завезут их в 1Password можно будет переходить. Пароли/SMS это зло во всех отношениях.';
    try {
      await nlpCall(input);
    } catch (error) {
      assert.strictEqual(error instanceof Error, true);
      assert.strictEqual(analyzeSentimentStub.callCount, 3);
    }
    await expect(nlpCall(input)).to.be.rejectedWith(Error);
  });
  
  it('サポート外言語の場合、criticalがtrueのエラーをスローする', async () => {
    
    const target = rewire('../../../convert/review/index.js');
    const nlpCall = target.__get__('nlpCall');
    const error = new Error;
    
    error.code = 3; // サポート外言語エラーの時のコード
    const analyzeSentimentStub = sinon.stub().throws(error);
    target.__set__('analyzeSentiment', analyzeSentimentStub);
    
    const input = 'Passkeys на Apple (Webauthn passwordless), в комбинации с сильной биометрией и Secure Enclave сделаны очень хорошо. Хранить ключи немного стремно в Keychain, но как только завезут их в 1Password можно будет переходить. Пароли/SMS это зло во всех отношениях.';
    try {
      await nlpCall(input);
    } catch (error) {
      assert.strictEqual(error instanceof Error, true);
      assert.strictEqual(error.critical, true);
      assert.strictEqual(analyzeSentimentStub.callCount, 1);
    }
  })
});