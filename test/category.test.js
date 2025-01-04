// Your test file (e.g., category.test.js)
import supertest from 'supertest';
import chai from 'chai';

const { expect } = chai;

// Note that we're using supertest.agent() to maintain the base URL
const request = supertest.agent('http://localhost:3001/api/categories');

// get categories test
it('GET all categories / should return status 200', async () => {
  try {
    const response = await request.get('/');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  } catch (error) {
    console.error(error);
    throw error;
  }
});

// get categories by id test
it('GET category by id / should return status 200', async () => {
  try {
    const response = await request.get('/6563168616ca3754b0063056');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
  } catch (error) {
    console.error(error);
    throw error;
  }
});