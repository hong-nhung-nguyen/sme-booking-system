const mockParse = jest.fn();

jest.mock("openai", () => 
        jest.fn().mockImplementation(() => ({
        responses: {
            parse: mockParse,
        },
    }))
);

const parseMessageIntent = require("../../../src/services/ai/intentParser.service");

const fixtures = [
    {
        name: "clear, complete booking request",
        message: "Hi, I am Sarah. I want to make a booking on 1/8 at 10am",
        output: {
            action: "book",
            service: null,
            preferredDate: "2026-08-01",
            preferredTime: "2026-08-01T00:00:00.000Z",
            clientName: "Sarah",
            clientContact: null,
            confidence: 0.95,
        },
        assert: (result) => {
            expect(result).toEqual(expect.objectContaining({
                action: "book",
                confidence: expect.any(Number),
            }));
            expect(result.confidence).toBeGreaterThan(0.8);
        },
    },
    {
        name: 'vague time request',
        message: 'Can I book sometime next week?',
        output: {
        action: 'book',
        service: null,
        preferredDate: null,
        preferredTime: null,
        clientName: null,
        clientContact: null,
        confidence: 0.3,
        },
        assert: (result) => {
        expect(result.preferredTime).toBeNull();
        expect(result.confidence).toBeLessThan(0.5);
        },
    },
    {
        name: 'informal request using a nickname',
        message: 'Hey, it is Jess — can I book a massage tomorrow?',
        output: {
        action: 'book',
        service: 'massage',
        preferredDate: '2026-08-02',
        preferredTime: null,
        clientName: 'Jess',
        clientContact: null,
        confidence: 0.85,
        },
        assert: (result) => {
        expect(result.clientName).toBe('Jess');
        },
    },
    {
        name: 'request without a date',
        message: 'I need a manicure, please.',
        output: {
        action: 'book',
        service: 'manicure',
        preferredDate: null,
        preferredTime: null,
        clientName: null,
        clientContact: null,
        confidence: 0.7,
        },
        assert: (result) => {
        expect(result.preferredDate).toBeNull();
        },
    },
    {
        name: 'unknown service type',
        message: 'Can I book a unicorn grooming appointment?',
        output: {
        action: 'book',
        service: 'unknown',
        preferredDate: null,
        preferredTime: null,
        clientName: null,
        clientContact: null,
        confidence: 0.4,
        },
        assert: (result) => {
        expect(result.service).toBe('unknown');
        },
    },
];

describe("parseMessageIntent", () => {
    beforeEach(() => {
        mockParse.mockReset();
    });

    test.each(fixtures)('$name', async ({ message, output, assert }) => {
        mockParse.mockResolvedValue({ output_parsed: output });

        const result = await parseMessageIntent(message);

        assert(result);
        expect(mockParse).toHaveBeenCalledTimes(1);
    });

    test('returns the default intent when the OpenAI request fails', async () => {
        mockParse.mockRejectedValue(new Error('OpenAI unavailable'));

        await expect(parseMessageIntent('Book a haircut')).resolves.toEqual({
        action: null,
        service: null,
        preferredDate: null,
        preferredTime: null,
        clientName: null,
        clientContact: null,
        confidence: 0,
        });
    });

    test('returns the default intent for an invalid message', async () => {
        await expect(parseMessageIntent()).resolves.toEqual({
        action: null,
        service: null,
        preferredDate: null,
        preferredTime: null,
        clientName: null,
        clientContact: null,
        confidence: 0,
        });

        expect(mockParse).not.toHaveBeenCalled();
    });
})
