// import swaggerAutogen from 'swagger-autogen';

// const doc = {
//   info: {
//     title: 'My Note API',
//     description: 'Otomatik Oluşturulan API Dokümantasyonu',
//   },
//   host: 'localhost:5000',
//   schemes: ['http'],
//   // JWT koruması kullanıyorsan bunu eklemelisin ki "Authorize" butonu çıksın
//   securityDefinitions: {
//     bearerAuth: {
//       type: 'apiKey',
//       in: 'header',
//       name: 'Authorization',
//       description: 'Başına "Bearer " ekleyerek tokenınızı girin. Örn: Bearer abc123...'
//     }
//   }
// };

// const outputFile = './swagger-output.json';
// const endpointsFiles = ['./server.ts']; // Buradan başlayarak tüm importları takip eder

// swaggerAutogen()(outputFile, endpointsFiles, doc);