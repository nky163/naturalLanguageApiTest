const language = require('@google-cloud/language');
// const {setTimeout} = require('timers/promise');

NLP_RETRY_COUNT = 3;

const mySetTimeout = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('finish');
    }, ms);
  });
}

const analyzeSentiment = async (reviewText) => {
  
  const client = new language.LanguageServiceClient();
  const document = {
    content: reviewText,
    type: 'PLAIN_TEXT',
  }
  
  const [result] = await client.analyzeSentiment({document: document});
  return result;
};

const nlpCall = async (reviewText) => {
  console.log('nlpCall invoked');
  
  let result;
  for (let retryCount = 0; retryCount < NLP_RETRY_COUNT; retryCount++) {
    try {
      if (retryCount > 0) {
        console.log('Sleep for 60 sec.');
        await mySetTimeout(600);
      }
      result = await analyzeSentiment(reviewText);
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
  
  return result.documentSentiment;
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