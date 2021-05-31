// ref: https://ajv.js.org/json-schema.html#keywords-for-arrays

// export default {
//   type: 'object',
//   properties: {
//     body: {
//       type: 'object',
//       properties: {
//         credentials: {
//           type: 'array',
//           minItems: 1,
//           additionalItems: false,
//           items: [{ type: 'object', required: ['user', 'password'] }]
//         }
//       },
//       required: ['credentials']
//     }
//   }
// }

const credentials = {
  type: 'object',
  properties: {
    user: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  },
  required: ['user', 'password']
}

export default {
  type: 'object',
  required: ['body'],
  properties: {
    // this will pass validation
    body: {
      type: 'object',
      required: ['credentials'],
      properties: {
        credentials: {
          type: 'array',
          minItems: 1,
          items: credentials
        }
      }
    }
  }
}
