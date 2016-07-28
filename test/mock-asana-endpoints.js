module.exports = [
  {
    pattern: 'http://asana.com(.*)',

    fixtures: function (match, params, headers) {
      if (match[1] === '/image'){
        return {
          body: 'some image',
          req: {
            path: 'image.png'
          }
        };
      }

      return {
        params: params,
        headers: headers
      };
    },

    get: function (match, data) {
      if (match[1] === '/image'){
        return data;
      }

      return {
        data: data,
        code: 200
      };
    },

    post: function (match, data) {
      return {
        data: data,
        code: 200
      };
    }
  }
];
