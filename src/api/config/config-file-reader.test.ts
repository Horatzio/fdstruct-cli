// import test from 'ava';
// import { readConfigFile } from './config-file-reader';
// import mock from 'mock-fs';
// import { FDstructArgumentException } from '../../exception/exceptions';

// test('readConfigFile returns the expected configuration', async (t) => {
//     t.pass();
//     // mock({
//     //     // 'fdstruct-config.yml': `
//     //     //     debug: true
//     //     //     variables:
//     //     //         $FOLDER1: ./folder1
//     //     //         $FOLDER2: ../folder2
//     //     // `
//     //     'fdstruct-config.yaml': ""
//     // })

//     // const config = await readConfigFile('fdstruct-config.yaml');
//     // t.deepEqual(config, {
//     //     debug: true,
//     //     variables: {
//     //         "$FOLDER1": "./folder1",
//     //         "$FOLDER2": "../folder2"
//     //     }
//     // });
// });

// test('readConfigFile returns default config if file does not exist', async (t) => {
//     const config = await readConfigFile('non-existent-file.json');

//     t.deepEqual(config, {
//         debug: false,
//         variables: {}
//     });
// });

// test('readConfigFile throws exception if file exists but is not yml', async (t) => {
//     mock({
//         'non-existent-file.json': ''
//     })
//     await t.throwsAsync(async () => {
//         await readConfigFile('non-existent-file.json');
//     }, { instanceOf: FDstructArgumentException, message: 'Invalid file extension. Must be [.yml, .yaml]' });
// });
