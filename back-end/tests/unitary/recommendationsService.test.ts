import { recommendationRepository } from './../../src/repositories/recommendationRepository';
import { recommendationService } from './../../src/services/recommendationsService';
import { jest } from "@jest/globals";

describe("recommendationService test suite", () => {
  const recommendationNameAndLink = {
    name: "Test recommendation",
    youtubeLink: "https://www.youtube.com/watch",
  };

  const recommendationFactory = {
    id: 1,
    name: "random name",
    youtubeLink: "https://www.youtube.com/watch",
    score: 2,
  };

  describe("Create recommendation tests suites", () => {
    it("Sucess in create recommendation", async () => {
      const { name } = recommendationNameAndLink;

      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValueOnce(null);

      jest
        .spyOn(recommendationRepository, "create")
        .mockResolvedValueOnce(null);

      await recommendationService.insert(recommendationNameAndLink);
      expect(recommendationRepository.findByName).toHaveBeenCalledWith(name);
      expect(recommendationRepository.create).toHaveBeenCalledTimes(1);
    });

    it("Fail trying create recommendation", async () => {
      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValueOnce(recommendationFactory);

      expect(recommendationService.insert(recommendationNameAndLink)).rejects.toEqual({
        message: "Recommendations names must be unique",
        type: "conflict",
      });
    });
  });

  describe("downvotes tests suites", () => {
    it("Sucess in trying to downvote", async () => {
      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValueOnce(recommendationFactory);

      jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValueOnce(recommendationFactory);

      await recommendationService.downvote(1);
      expect(recommendationRepository.find).toHaveBeenCalledWith(1);
      expect(recommendationRepository.updateScore).toHaveBeenLastCalledWith(1, "decrement");
    });
  });
});