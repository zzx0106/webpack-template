const APP_MODE = process.env.APP_MODE;
if (APP_MODE === 'prod') {
  process.env.NODE_ENV = 'production';
} else if (APP_MODE === 'dev') {
  process.env.NODE_ENV = 'development';
} else if (APP_MODE === 'dbg') {
  process.env.NODE_ENV = 'production';
} else {
  process.env.NODE_ENV = 'production';
}
