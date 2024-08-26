import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        version: 'v1.0.0',
        title: 'Frint',
        description: 'Implementation of Swagger with TypeScript'
    },
    // host: 'localhost:8000',                 // by default: 'localhost:3000'
    // basePath: '/api/v1',        // by default: '/'
    servers: [
        {
            url: 'http://localhost:8000/api/v1',
            description: 'Development server v1'
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            }
        },
        schemas: {
            SignUpUser: {
                    $uname: 'test name',
                    $email: "test@gmail.com",
                    $password: '1234567890',
                    $phno: '1234567890',
                    $confirmPassword: '1234567890'
            }
        }
    }
};

const outputFile = './swagger_output.json';
//this might cause issue 
const endpointsFiles = ['./routes/**/*.ts'];
// const endpointsFiles = ['./routes/**/*.ts', './routes/v1/User.ts', './routes/v1/authentication.ts'];

swaggerAutogen({openapi: '3.0.0'})(outputFile, endpointsFiles, doc);