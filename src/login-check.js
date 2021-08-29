const CeiCrawler = require('cei-crawler');

module.exports.handler = async (event, context, callback) => {

  console.log(event)
  const body = JSON.parse(event.body);

  const username = body.username;
  const pw = body.password;

  let ceiCrawler = new CeiCrawler(username, pw);

  return ceiCrawler.login().then(() => {
    console.log('Password correct');

    return callback(null, {
      statusCode: 200,
      body: 'Password correct',
    });
  })
  .catch(() => {
    return callback(null, {
      statusCode: 401,
      body: 'Password incorrect',
    });
  });

}
