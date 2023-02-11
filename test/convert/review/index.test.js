// 'Passkeys на Apple (Webauthn passwordless), в комбинации с сильной биометрией и Secure Enclave сделаны очень хорошо. Хранить ключи немного стремно в Keychain, но как только завезут их в 1Password можно будет переходить. Пароли/SMS это зло во всех отношениях.'
// code: 3,
//   details: 'The language ru is not supported for document_sentiment analysis.',
//   metadata: Metadata { internalRepr: Map(0) {}, options: {} },
//   note: 'Exception occurred in retry method that was not classified as transient'


const rewire = require('rewire');
const chai = require('chai');
const { assert } = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('nlpCallのテスト', function() {
  this.timeout(30000);
  
  it('サポート言語の場合、感情分析結果を返す', async () => {
    
    const target = rewire('../../../convert/review/index.js');
    const nlpCall = target.__get__('nlpCall');
    const input = 'aaa';
    const ret = await nlpCall(input);
    assert.isNumber(ret.magnitude);
    assert.isNumber(ret.score);
  });
  
  it('感情分析に失敗した場合、例外が発生する', async () => {
    
    const target = rewire('../../../convert/review/index.js');
    const nlpCall = target.__get__('nlpCall');
    
    const input = 'Passkeys на Apple (Webauthn passwordless), в комбинации с сильной биометрией и Secure Enclave сделаны очень хорошо. Хранить ключи немного стремно в Keychain, но как только завезут их в 1Password можно будет переходить. Пароли/SMS это зло во всех отношениях.';
    await expect(nlpCall(input)).to.be.rejectedWith(Error);
  });
  
});