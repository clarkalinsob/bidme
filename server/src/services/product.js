const db = require('../utils/db');

const mapper = 'product';

const schema = {
  id: {
    type: 'integer',
    example: '1'
  },
  name: {
    type: 'string',
    example: 'sample'
  }
};

async function get(__, input) {
  const options = { params: { id: input.id }, schema };
  return db.findOne(mapper, 'get', options);
}

Object.assign(module.exports, {
  schema,
  get
});
