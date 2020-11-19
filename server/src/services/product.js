const db = require('../utils/db');

const mapper = 'product';
const schema = {
  id: {
    type: 'integer',
    example: '1'
  },
  product_name: {
    type: 'string',
    example: 'sample'
  },
  seller_name: {
    type: 'string',
    example: 'Test User'
  },
  seller_email: {
    type: 'string',
    example: 'testuser@gmail.com'
  },
  image_url: {
    type: 'string',
    example: 'https://picsum.photos/200/300'
  },
  valid_from: {
    type: 'datetime',
    example: '2020-11-19 14:54:50.25774+08'
  },
  valid_to: {
    type: 'datetime',
    example: '2020-11-19 14:54:50.25774+08'
  }
};

async function list(__, input, requestor) {
  const params = {
    ...input,
    email: requestor.email
  };
  const options = { params, schema };
  const items = await db.findAll(mapper, 'list', options);

  return {
    items
  };
}

async function get(__, input) {
  const options = { params: { id: input.id }, schema };
  const item = await db.findOne(mapper, 'get', options);

  return item;
}

async function insert(__, input, requestor) {
  // insert to db
  input.created_by = requestor.email;
  const result = await db.writeQuery(mapper, 'insert', input);

  // retrieve from db
  const options = {
    params: { id: result.rows[0].id },
    schema
  };
  const item = await db.findOne(mapper, 'get', options);

  return item;
}

async function update(__, input, requestor) {
  const product = await db.readQuery(mapper, 'get', { id: input.id });
  if (product.length < 1) {
    return {};
  }

  // update the row
  const params = { ...product[0], ...input };
  await db.writeQuery(mapper, 'update', params);

  // retrieve from db
  const options = { params: { id: input.id }, schema };
  const item = db.findOne(mapper, 'get', options);

  return item;
}

async function remove(__, input, user) {
  const product = await db.readQuery(mapper, 'get', { id: input.id });
  if (product.length < 1) {
    return {};
  }

  product[0].deleted_at = new Date().toISOString();
  await db.writeQuery(mapper, 'delete', product[0]);

  return 'Successfully deleted.';
}

Object.assign(module.exports, {
  schema,
  list,
  get,
  insert,
  remove
});
