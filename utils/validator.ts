import { ZodError } from 'zod';

//directly inside string
export const formatZodErrors = (error: ZodError): string => {
    return error.errors.map((err) => {
        // Construct a readable error message for each validation issue
        return `Field '${err.path.join('.')}'is ${err.message}`;
    }).join(', ');
}

export const formatArrZodErrors = (error: ZodError)  => {
    // const errorMessages: string[] = [];
    //  error.errors.forEach((fieldErrors) => {
    //       errorMessages.push(fieldErrors.message);
    //   });

    //   return errorMessages

//alternative solution
return error.errors.map((fieldError) => `Field '${fieldError.path.join('.')}'is ${fieldError.message}`);
}


//giving a general error, an array of error messages with the field associated
// export const formatZodErrors = (error: ZodError): { field: string, message: string }[] => {
//     return error.errors.map((err) => {
//         const field = err.path.join('.');
//         let message = '';

//         // Customize the message based on the error code
//         switch (err.code) {
//             case 'invalid_type':
//                 message = `Invalid type provided for ${field}.`;
//                 break;
//             case 'invalid_string':
//                 message = `Invalid string format for ${field}.`;
//                 break;
//             case 'too_small':
//                 message = `${field} is too short.`;
//                 break;
//             case 'too_big':
//                 message = `${field} is too long.`;
//                 break;
//             case 'custom':
//                 message = err.message; // Use custom error message from Zod
//                 break;
//             default:
//                 message = `Invalid input for ${field}.`;
//         }

//         return { field, message };
//     });
// };

//only one general message based on priority
export const formatGenZodErrors = (error: ZodError): { message: string } => {
    const errorCodes = error.errors.map(err => err.code);

    // Define error messages based on types of errors
    const generalMessages = {
        invalid_type: 'One or more fields have incorrect data types.',
        too_small: 'One or more fields are too short.',
        too_big: 'One or more fields are too long.',
        invalid_string: 'One or more fields have invalid string format.',
        // custom: 'Some fields contain invalid data.',
        default: 'There was an issue with your input.',
    };

    // Determine which error message to use based on the error codes present
    if (errorCodes.includes('invalid_type')) {
        return { message: generalMessages.invalid_type };
    } 
    if (errorCodes.includes('too_small')) {
        return { message: generalMessages.too_small };
    }
    if (errorCodes.includes('too_big')) {
        return { message: generalMessages.too_big };
    }
    if (errorCodes.includes('invalid_string')) {
        return { message: generalMessages.invalid_string };
    }
    if (errorCodes.includes('custom')) {
        return { message: error.errors[0].message };
    }

    // Fallback to a default message if no specific error types are present
    return { message: generalMessages.default };
};