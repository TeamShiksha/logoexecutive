const { formExists, createForm } = require("../../../services");
const { ContactUsCollection } = require("../../../utils/firestore");
const { cleanDB } = require("../../../utils/cleanDB");
const { ContactUs } = require("../../../models");
const { mockContactUsForm } = require("../../../utils/mocks/contactUs");

describe("formExists", () => {
  afterEach(async function () {
    await cleanDB();
  });

  test("should return true if form activityStatus is true for given email", async () => {
    const user = await ContactUsCollection.doc(mockContactUsForm[1].contactId).set(mockContactUsForm[1]);
    const email = "active@gmail.com";
    const exists = await formExists(email);
    expect(exists).toBe(true);
  });

  test("should return false if form does not exist or the activityStatus is false for given email", async () => {
    const user = await ContactUsCollection.doc(mockContactUsForm[0].contactId).set(mockContactUsForm[0]);
    const exist = await formExists("nonactive@example.com");
    expect(exist).toBe(false);
  });

  test("should return false if the query result is empty", async () => {
    jest.spyOn(ContactUsCollection, "where").mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true })
      })
    });

    const email = "nonexistent@example.com";
    const exists = await formExists(email);
    expect(exists).toBe(false);
  });

  test("should return true if the query result is not empty", async () => {
    jest.spyOn(ContactUsCollection, "where").mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: false })
      })
    });

    const email = "existent@example.com";
    const exists = await formExists(email);
    expect(exists).toBe(true);
  });

  it("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(ContactUsCollection, "where").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });
    const email = "error@example.com";
    await expect(formExists(email)).rejects.toThrow("Firestore operation failed");
  });
});

describe("createForm", () => {
  afterEach(async function () {
    await cleanDB();
  });

  it("should create a form in database and return the created form object", async () => {
    const formData = {
      name: "Aman",
      email: "xartpvtasas@gmail.com",
      message: "Hello"
    };
    const addedForm = await createForm(formData);
    expect(addedForm).toBeInstanceOf(ContactUs);
  });

  it("should not create a form when formData is incomplete", async () => {
    jest.spyOn(ContactUsCollection, "doc").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });
    const formData = {
      name: "Test User"
    };
    await expect(createForm(formData)).rejects.toThrow("Firestore operation failed");
  });

  it("should return null if Firestore set operation does not return a result", async () => {
    jest.spyOn(ContactUsCollection, "doc").mockReturnValue({
      set: jest.fn().mockResolvedValue(null)
    });
    const formData = {
      name: "A User",
      email: "usermail@example.com",
      message: "Hello, this is a test message."
    };
    const result = await createForm(formData);
    expect(result).toBeNull();
  });

  it("should return a ContactUs instance with default values when Firestore set operation returns partial data (edge case)", async () => {
    jest.spyOn(ContactUsCollection, "doc").mockReturnValue({
      set: jest.fn().mockResolvedValue({})
    });

    const formData = {
      name: "New User",
      email: "newuser@example.com",
      message: "Testing minimal data handling."
    };
    const result = await createForm(formData);
    expect(result).toBeInstanceOf(ContactUs);
    expect(result.name).toEqual(formData.name);
    expect(result.email).toEqual(formData.email);
    expect(result.message).toEqual(formData.message);

    expect(result.assignedTo).toBeNull();
  });
});

