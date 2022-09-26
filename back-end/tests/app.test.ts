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

describe("GET /recommendations", () => {
    it("200 ~ Get all recommendations", async () => {
        const firstRecommedation = recommendationFactory();
        const secondRecomendation = recommendationFactory();
        
        await agent.post("/recommendations").send(firstRecommedation);
        await agent.post("/recommendations").send(secondRecomendation);

        const response = await agent.get("/recommendations");
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);

        expect(response.body[0].name).toBe(secondRecomendation.name);
        expect(response.body[0].youtubeLink).toBe(secondRecomendation.youtubeLink);

        expect(response.body[1].name).toBe(firstRecommedation.name);
        expect(response.body[1].youtubeLink).toBe(firstRecommedation.youtubeLink);
    });

    it("200 ~ Get zero recommendations", async () => {
        const response = await agent.get("/recommendations");
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    it("200 ~ Get random recommendation", async () => {
        const firstRecommendation = recommendationFactory();
        const secondRecommendation = recommendationFactory();

        await agent.post("/recommendations").send(firstRecommendation);
        await agent.post("/recommendations").send(secondRecommendation);

        const response = await agent.get("/recommendations/random");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(`${firstRecommendation.name} ${secondRecommendation.name}`).toContain(response.body.name);
    });

    it("200 ~ Get recommendation by id", async () => {
        const body = recommendationFactory();
    
        await agent.post("/recommendations").send(body);
        
        const recommendation = await prisma.recommendation.findFirst({
          where: { name: body.name, youtubeLink: body.youtubeLink },
        });
        const response = await agent.get(`/recommendations/${recommendation.id}`);
    
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(recommendation.name);
        expect(response.body.youtubeLink).toBe(recommendation.youtubeLink);
      });
});