const ApiResponse = require('st4ck-lib-apiresponse');
const renderer = require('../../api-response-renderer');

module.exports = function ({ contextKey = 'apiResponse', showStackTraceOnError = false, logger = console }) {
  return async (ctx, next) => {
    const apiResponse = new ApiResponse();
    apiResponse.addErrorDetailSanitize((err) => {
      if (err.properties) {
        if (err.properties.kind && err.properties.kind != '') {
          err.kind = err.properties.kind;
        } else if (err.properties.type && err.properties.type != '') {
          err.kind = err.properties.type;
        } else if (!err.hasOwnProperty('kind')) {
          err.kind = 'unknown';
        }
        delete err.properties;
      }
      return err;
    });
    apiResponse.showStackTraceOnError = showStackTraceOnError;
    ctx[contextKey] = apiResponse;

    const start = new Date();
    try {
      await next();
    } catch (err) {
      if (!err.code || err.code > 499) {
        logger.error(err.message || err, err.stack);
      } else {
        logger.log(err.message || err, err.stack);
      }

      ctx[contextKey].resetData();
      ctx[contextKey].setError(err);
      if (err.details) {
        ctx[contextKey].addErrorDetails(err.details);
      } else if (err.errors) {
        ctx[contextKey].addErrorDetails(err.errors);
      }
      ctx.response.status = ctx[contextKey].error.code === 500 ? 500 : 200;
    } finally {
      // Add common metas
      ctx[contextKey].setMeta('dispatch_start', start);
      ctx[contextKey].setMeta('dispatch_end', new Date());
      ctx[contextKey].setMeta('dispatch_duration', (new Date() - start));

      // Output format in a nice way
      const format = ctx.accepts('json', 'html');
      ctx.body = renderer(ctx[contextKey], format, showStackTraceOnError);
    }
  };
};
