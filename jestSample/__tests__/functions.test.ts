// todo: ここに単体テストを書いてみましょう！
import { getFirstNameThrowIfLong, sumOfArray } from "../functions";
import { asyncSumOfArray } from "../functions";
import { asyncSumOfArraySometimesZero } from "../functions";
import { Database } from "../util/index";
import { NameApiService } from "../nameApiService";
import axios from "axios";

// モック化
jest.mock("../util/index");
jest.mock("../nameApiService");
jest.mock("axios");

const DatabaseMock = Database as jest.Mock<Database>;
const NameApiServiceMock = NameApiService as jest.Mock;
// const NameApiServiceMock = NameApiService as jest.Mock<NameApiService>;
const mockAxios = axios as jest.Mocked<typeof axios>;

/**
 * sumOfArray
 */
test("sumOfArray 正常系", (): void => {
  expect(sumOfArray([1, 1])).toBe(2);
});

// 例外をテストするときはexpectの引数に関数を渡す必要がある。
test("sumOfArray 異常系1", (): void => {
  expect((): number => sumOfArray([])).toThrow(
    "Reduce of empty array with no initial value"
  );
});

// Number型を渡さなければならないのにstring型を通すとそもそもコンパイルが通らない。
// test("sumOfArray 異常系2", (): void => {
//   expect(sumOfArray(["test"])).toThrow(
//     "Reduce of empty array with no initial value"
//   );
// });

/**
 * asyncSumOfArray
 */
test("asyncSumOfArray 正常系", async (): Promise<void> => {
  await expect(asyncSumOfArray([1, 1])).resolves.toBe(2);
});

test("asyncSumOfArray 異常系", async (): Promise<void> => {
  await expect((): Promise<number> => asyncSumOfArray([])).rejects.toThrow(
    "Reduce of empty array with no initial value"
  );
});

/**
 * asyncSumOfArraySometimesZero
 */
test("asyncSumOfArraySometimesZero　正常系", async (): Promise<void> => {
  // const save = jest.fn((): void => {});
  DatabaseMock.mockImplementation(
    (): Database => {
      return {
        save: (): void => {},
      };
    }
  );
  // const databaseMock = DatabaseMock.mock.instances[0];
  // テストコードの中でMockをインスタンス化することは、依存していることにならないか？
  const databaseMock = new DatabaseMock();
  await expect(
    asyncSumOfArraySometimesZero([1, 1], databaseMock)
  ).resolves.toBe(2);
});

test("asyncSumOfArraySometimesZero　異常系", async (): Promise<void> => {
  DatabaseMock.mockImplementation(
    (): Database => {
      return {
        save: (): void => {
          throw new Error("fail!");
        },
      };
    }
  );
  const databaseMock = new DatabaseMock();
  await expect(
    asyncSumOfArraySometimesZero([1, 1], databaseMock)
  ).resolves.toBe(0);
});

/**
 * getFirstNameThrowIfLong
 */
test("getFirstNameThrowIfLong 正常系", async (): Promise<void> => {
  NameApiServiceMock.mockImplementation((): { getFirstName: () => void } => {
    return {
      getFirstName: async (): Promise<string> => {
        // eslint-disable-next-line @typescript-eslint/camelcase
        const users = { first_name: "niiya" };
        const response = { data: users };
        mockAxios.get.mockResolvedValue(response);
        const firstName = response.data.first_name as string;
        return firstName;
      },
    };
  });
  // getFirstNameThrowLongに渡す引数の型を関数に指定したら、これでもいけそう。
  // const getFirstNameSpy = jest
  //   .spyOn(new NameApiService(), "getFirstName")
  //   .mockImplementation(
  //     async (): Promise<string> => {
  //       // eslint-disable-next-line @typescript-eslint/camelcase
  //       const users = { first_name: "niiya" };
  //       const response = { data: users };
  //       mockAxios.get.mockResolvedValue(response);
  //       const firstName = response.data.first_name as string;
  //       return firstName;
  //     }
  //   );
  const nameApiServiceMock = new NameApiServiceMock();
  await expect(getFirstNameThrowIfLong(6, nameApiServiceMock)).resolves.toEqual(
    "niiya"
  );
});

test("getFirstNameThrowIfLong 異常系", async (): Promise<void> => {
  NameApiServiceMock.mockImplementation((): { getFirstName: () => void } => {
    return {
      getFirstName: async (): Promise<string> => {
        // eslint-disable-next-line @typescript-eslint/camelcase
        const users = { first_name: "niiya" };
        const response = { data: users };
        mockAxios.get.mockResolvedValue(response);
        const firstName = response.data.first_name as string;
        return firstName;
      },
    };
  });
  const nameApiServiceMock = new NameApiServiceMock();
  await expect(getFirstNameThrowIfLong(4, nameApiServiceMock)).rejects.toThrow(
    "first_name too long"
  );
});
