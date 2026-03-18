import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: {
        address: 'prisma/schema.prisma',
    },
    engine: {
        binaryTarget: 'native',
    },
});
