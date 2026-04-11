import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });
let token = '';

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function runTests() {
  try {
    console.log('1. Testing Register...');
    const regRes = await api.post('/auth/register', {
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123'
    });
    console.log('Register success:', regRes.data.email);
    token = regRes.data.token;

    console.log('\n2. Testing Get Profile (/auth/me)...');
    const meRes = await api.get('/auth/me');
    console.log('Profile success:', meRes.data.username);

    console.log('\n3. Testing Create Quiz...');
    const createRes = await api.post('/quizzes', {
      title: 'Test Quiz',
      slug: 'test-quiz',
      description: 'A test quiz',
      theme: 'indigo'
    });
    console.log('Quiz created:', createRes.data._id);
    const quizId = createRes.data._id;

    console.log('\n4. Testing Update & Publish Quiz...');
    const updateRes = await api.put(`/quizzes/${quizId}`, {
      title: 'Updated Test Quiz',
      results: [{ key: 'res1', title: 'Result 1', description: 'Desc 1', image: '' }],
      questions: [{
        questionText: 'Q1',
        options: [{ text: 'Opt1', scoreMap: { res1: 1 } }]
      }]
    });
    const publishRes = await api.put(`/quizzes/${quizId}/publish`);
    console.log('Quiz published:', publishRes.data.isPublished);

    console.log('\n5. Testing Fetch Explore Quizzes...');
    const exploreRes = await api.get('/quizzes/explore');
    console.log('Explore returned length:', exploreRes.data.length);

    console.log('\n6. Testing Quiz Play Flow (Submit Attempt)...');
    const attemptRes = await api.post(`/attempts/${quizId}`, {
      resultKey: 'res1',
      selectedOptions: []
    });
    console.log('Attempt logged:', attemptRes.data._id);

    console.log('\n✅ All tests passed successfully!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.response?.data || err.message);
  }
}

runTests();
