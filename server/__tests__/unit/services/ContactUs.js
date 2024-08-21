const { formExists, createForm, updateForm } = require("../../../services");
const { ContactUs, Users } = require("../../../models");
const { mockContactUsForm } = require("../../../utils/mocks/contactUs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { mockUsers } = require("../../../utils/mocks/Users");
const { UserType } = require("../../../utils/constants");

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("formExists", () => {
  afterEach(async () => {
    await ContactUs.deleteMany({});
  });

  test("should return false if the query result is empty", async () => {
    const email = "nonexistent@example.com";
    const exists = await formExists(email);
    expect(exists).toBe(false);
  });

  test("should return true if form activityStatus is true for given email", async () => {
    const form = new ContactUs(mockContactUsForm[1]);
    await form.save();
    const email = "active@gmail.com";
    const exists = await formExists(email);
    expect(exists).toBe(true);
  });

  test("should return false if form does not exist or the activityStatus is false for given email", async () => {
    const form = new ContactUs(mockContactUsForm[0]);
    await form.save();
    const exist = await formExists("nonactive@gmail.com");
    expect(exist).toBe(false);
  });

  test("should return true if the query result is not empty", async () => {
    const form = new ContactUs(mockContactUsForm[1]);
    await form.save();
    const email = "active@gmail.com";
    const exists = await formExists(email);
    expect(exists).toBe(true);
  });

  it("should throw an error if the MongoDB operation fails", async () => {
    jest.spyOn(ContactUs, "findOne").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    const email = "error@example.com";
    await expect(formExists(email)).rejects.toThrow("MongoDB operation failed");
  });
});

describe("createForm", () => {
  afterEach(async () => {
    await ContactUs.deleteMany({});
  });

  it("should create a form in database and return the created form object", async () => {
    const formData = {
      name: "Aman",
      email: "xartpvtasas@gmail.com",
      message: "Hello",
    };
    const addedForm = await createForm(formData);
    expect(addedForm).toBeInstanceOf(ContactUs);
  });

  it("should not create a form when formData is incomplete", async () => {
    const formData = {
      name: "Test User",
    };
    await expect(createForm(formData)).rejects.toThrow(
      mongoose.Error.ValidationError,
    );
  });

  it("should return null if MongoDB save operation fails", async () => {
    jest.spyOn(ContactUs.prototype, "save").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    const formData = {
      name: "A User",
      email: "usermail@example.com",
      message: "Hello, this is a test message.",
    };
    await expect(createForm(formData)).rejects.toThrow(
      "MongoDB operation failed",
    );
  });

  it("should return a ContactUs instance with default values when MongoDB save operation returns partial data (edge case)", async () => {
    const formData = {
      name: "New User",
      email: "newuser@example.com",
      message: "Testing minimal data handling.",
    };
    const result = await createForm(formData);
    expect(result).toBeInstanceOf(ContactUs);
    expect(result.name).toEqual(formData.name);
    expect(result.email).toEqual(formData.email);
    expect(result.message).toEqual(formData.message);
    expect(result.assignedTo).toBeNull();
  });
});

const mockOperator = new Users(
  mockUsers.find((item) => item.userType === UserType.OPERATOR),
);
describe("updateForm", () => {
  afterEach(async () => {
    await ContactUs.deleteMany({});
  });

  it("should update the form in the database and return the result", async () => {
    const form = new ContactUs(mockContactUsForm[0]);
    await form.save();
    const updatedForm = await updateForm(
      form._id,
      form.email,
      "This is a reply",
      mockOperator._id,
    );
    expect(updatedForm.reply).toEqual("This is a reply");
    expect(updatedForm.assignedTo).toEqual(mockOperator._id);
  });

  it("should throw an error if the form is not found", async () => {
    await expect(
      updateForm(
        new mongoose.Types.ObjectId(),
        "nonexistent@example.com",
        "Reply",
        mockOperator._id,
      ),
    ).rejects.toThrow("Form not found");
  });

  it("should throw an error if MongoDB update operation fails", async () => {
    const form = new ContactUs(mockContactUsForm[0]);
    await form.save();
    jest.spyOn(ContactUs, "findOne").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    jest.spyOn(ContactUs, "updateOne").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    await expect(
      updateForm(form._id, form.email, "Reply", mockOperator._id),
    ).rejects.toThrow("MongoDB operation failed");
  });
});
