import supertest from "supertest";
import * as scenario from "./factory/scenarioFactory.js"
import { recommendationFactory } from "./factory/recommendationFactory.js";
import app from "../src/app.js";

import { prisma } from "../src/database.js";

beforeEach(async () => {
    await scenario.deleteAllData();
});

const agent = supertest.agent(app);

describe("🌱 ~ POST /recommendations", () => {
    it("✨ 201 ~ Create a new recommendation", async () => {
      const body = recommendationFactory();
  
      const response = await agent.post("/recommendations").send(body);
      expect(response.status).toBe(201);
  
      const { name, youtubeLink } = body;
      const checkUser = await prisma.recommendation.findFirst({
        where: { name, youtubeLink },
      });
  
      expect(checkUser).not.toBeNull();
    });

});