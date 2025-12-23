// Test setup file

// Mock Prisma client for testing
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        disasterReport: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        reportStatus: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}))

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
    app: undefined,
    auth: undefined,
    db: undefined,
    storage: undefined,
}))

jest.mock('@/lib/firestore', () => ({
    syncReportToFirestore: jest.fn(),
    updateReportStatusInFirestore: jest.fn(),
    deleteReportFromFirestore: jest.fn(),
}))

// Reset mocks between tests
beforeEach(() => {
    jest.clearAllMocks()
})

// Clean up after all tests
afterAll(async () => {
    // Disconnect from database
})
