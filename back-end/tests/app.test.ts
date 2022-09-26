import supertest from "supertest";
import * as scenario from "./factory/scenarioFactory.js"
import { recommendationFactory } from "./factory/recommendationFactory.js";
import app from "../src/app.js";

import { prisma } from "../src/database.js";

beforeEach(async () => {
    await scenario.deleteAllData();
});

const agent = supertest.agent(app);

describe("POST /recommendations", () => {
    it("201 ~ Create a new recommendation", async () => {
        const body = recommendationFactory();

        const response = await agent.post("/recommendations").send(body);
        expect(response.status).toBe(201);

        const { name, youtubeLink } = body;
        const checkUser = await prisma.recommendation.findFirst({
            where: { name, youtubeLink },
        });

        expect(checkUser).not.toBeNull();
    });

    it("409 ~ Conflict when creating a new recommmendation", async () => {
        const body = recommendationFactory();

        const create = await agent.post("/recommendations").send(body);
        expect(create.status).toBe(201);

        const createAgain = await agent.post("/recommendations").send(body);
        expect(createAgain.status).toBe(409);
    });

    it("422 ~ Create a new recommendation with invalid data", async () => {
        const create = await agent.post("/recommendations").send({});
        expect(create.status).toBe(422);
    });
});