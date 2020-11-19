const service = require('../services/product');
const logger = require('../utils/logger');

module.exports = {
  get: {
    method: 'get',
    path: '/product/:id',
    async resolver(__, input, ctx) {
      logger.info(`GET /product/${input.id} id:${ctx.req.user.id}`);
      const data = await service.get(__, input, ctx.req.user, ctx);
      return data;
    }
  }
};
