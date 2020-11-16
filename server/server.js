const app = require('./src');
const PORT = 4000;

process.on('uncaughtException', error => {
  console.log(error);
});

app.listen(PORT, () => console.log(`App running on PORT ${PORT}`));
