const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => res.send('test'));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
