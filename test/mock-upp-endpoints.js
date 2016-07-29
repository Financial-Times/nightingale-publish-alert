module.exports = [
  {
    pattern: 'http://upp.ft.com([/a-zA-Z]+)\?(.*)',

    fixtures: function (match, params, headers) {
      if (match[1] === '/content/notifications'){
        return {
          body: {
            notifications: [
              {
                msg: 'fake notification',
                type: 'UPDATE'
              },
              {
                msg: 'fake delete',
                type: 'DELETE'
              }
            ],
            links: [
              {
                href: 'http://upp.ft.com/content/end?since=a_long_while_ago'
              }
            ]
          }
        };
      }

      if (match[1] === '/content/end'){
        return {
          body: {}
        };
      }

      if (match[1] === '/content/uuid'){
        return {
          body: {
            title: 'Title',
            content: 'Something really good happened for once!'
          },
          ok: true
        };
      }

      return {
        params: params,
        headers: headers
      };
    },

    get: function (match, data) {
      if (match[1] === '/content/notifications'){
        return data;
      }

      if (match[1] === '/content/end'){
        return data;
      }

      if (match[1] === '/content/uuid'){
        return data;
      }

      if (match[1] === '/bad/request'){
        return {
          ok: false
        };
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
