const language = require('@google-cloud/language');
// const {setTimeout} = require('timers/promise');

NLP_RETRY_COUNT = 8;

const mySetTimeout = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('finish');
    }, ms);
  });
}

const nlpCall = async (review_text) => {
  console.log('nlpCall invoked');
  const client = new language.LanguageServiceClient();
  const document = {
    content: review_text,
    type: 'PLAIN_TEXT',
  }
  
  // NaturalLanguageAPIでエラーが発生した場合、一定時間後にリトライ
  let nlp_result = '';
  const analyzeSentiment = () => {
    console.log('analyzeSentiment invoked');
    return new Promise(async (resolve, reject) => {
      try {
        [nlp_result] = await client.analyzeSentiment({document: document});
      } catch(error) {
        // エラーが発生したらReject
        console.log(error);
        reject('Error');
      }
      // 正常終了時はResolve
      resolve('OK');
    });
  };
  
  let result;
  for (let retryCount = 0; retryCount < NLP_RETRY_COUNT; retryCount++) {
    try {
      if (retryCount > 0) {
        console.log('Sleep for 60 sec.');
        await mySetTimeout(6000);
      }
      result = await analyzeSentiment();
    } catch(error) {
      console.log(`NaturalLanguageAPI Error(${retryCount + 1} time).`, error);
    }
    
    if (result) {
      break;
    }
  }
  
  if (!result) {
    throw new Error('Retried NaturalLanguageAPI error.');
  }
  
  return nlp_result.documentSentiment;
}

const convertReview = async (type, review) => {
  const sentiment = await nlpCall();
}

const saveReview = async (type, review) => {
  console.log('saveReview');
  return true;
}



module.exports = async (message, context) => {
  // メイン処理
  const msg = message.data
    ? Buffer.from(message.data, 'base64').toString()
    : '{}';
  let review = JSON.parse(msg);
  const type = review.type;
  
  review = await convertReview(type, review);
  await saveReview(type, review);
}