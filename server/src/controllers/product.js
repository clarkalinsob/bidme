const service = require('../services/product');
const logger = require('../utils/logger');

module.exports = {
  list: {
    method: 'get',
    path: '/product',
    async resolver(__, input, ctx) {
      logger.info(
        `GET /product email:${ctx.req.user.email} param:order=${input.order}&limit=${input.limit}`
      );
      const data = await service.list(__, input, ctx.req.user, ctx);
      return data;
    }
  },

  get: {
    method: 'get',
    path: '/product/:id',
    async resolver(__, input, ctx) {
      logger.info(`GET /product/${input.id} email:${ctx.req.user.email}`);
      const data = await service.get(__, input, ctx.req.user, ctx);
      return data;
    }
  },

  upsert: {
    method: 'post',
    path: '/product',
    async resolver(options, input, ctx) {
      logger.info(
        `POST /product email:${ctx.req.user.email}`,
        `requestBody:${JSON.stringify(input)}`
      );
      if (options.method === 'delete') {
        data = await service.remove(options, input, ctx.req.user, ctx);
      } else if (options.method === 'update') {
        data = await service.update(options, input, ctx.req.user, ctx);
      } else {
        data = await service.insert(options, input, ctx.req.user, ctx);
      }
      return data;
    }
  }
};
