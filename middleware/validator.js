// const Joi = require("joi");

// exports.signupSchema = Joi.object({
//     email: Joi.string()
//     .min(6)
//     .max(225)
//     .required()
//     .email({
//         tlds: { allow: ['com', 'in'] }
//     }),
//     password: Joi.string()
//     .required()
//     .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),

//     aadharNumber:Joi.string()
//      .pattern(/^\d{12}$/)
//     .min(12)
//     .required()
//     .messages({
//             'string.pattern.base': 'Aadhaar must be exactly 12 digits',
//             'any.required': 'Aadhaar is required',
//         })

// })

const Joi = require("joi");

exports.signupSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(225)
    .required()
    .email({ tlds: { allow: ['com', 'in'] } }),

  password: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
      'any.required': 'Password is required',
    }),
});

exports.acceptCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(225)
    .required()
    .email({ tlds: { allow: ['com', 'in'] } }),

  providedCode: Joi.number()
})

exports.changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
      'any.required': 'Password is required',
    }),
  oldPassword: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
      'any.required': 'Password is required'
    }),
})

exports.acceptFP = Joi.object({
  email: Joi.string()
    .min(6)
    .max(225)
    .required()
    .email({ tlds: { allow: ['com', 'in'] } }),
  providedCode: Joi.number(),

  newPassword: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
      'any.required': 'Password is required',
    }),

})

exports.createPostSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(60)
    .required(),

  descriptions: Joi.string()
    .min(3)
    .max(600)
    .required(),

    userId:Joi.string().required()
})