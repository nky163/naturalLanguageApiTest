// 'Passkeys на Apple (Webauthn passwordless), в комбинации с сильной биометрией и Secure Enclave сделаны очень хорошо. Хранить ключи немного стремно в Keychain, но как только завезут их в 1Password можно будет переходить. Пароли/SMS это зло во всех отношениях.'

const rewire = require('rewire');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('nlpCallのテスト', function() {
  this.timeout(3000);
  
  const target = rewire('../../../convert/review/index.js');
  const nlpCall = target.__get__('nlpCall');
  
  it('')
  
  it('サポート外言語の場合、エクセプションがでる', async () => {
    const input = 'aaaa';
    try {
      const ret = await nlpCall(input);
      console.log('ret:');
      console.log(ret);
    } catch (error) {
      console.log(error);
    }
  });
});