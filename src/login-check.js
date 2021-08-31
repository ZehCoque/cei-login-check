const CeiCrawler = require('cei-crawler');

const headers = {
  "Access-Control-Allow-Headers" : "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

module.exports.handler = async (event, context, callback) => {

  const body = JSON.parse(event.body);

  const username = body.username;
  const pw = body.password;

  let ceiCrawler = new CeiCrawler(username, pw);

  return ceiCrawler.login().then(() => {
    console.log('Password correct');

    return callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({message: 'Password correct'}),
    });
  })
  .catch((err) => {
    console.log(err)
    return callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({message: 'Password incorrect'}),
    });
  });

}
