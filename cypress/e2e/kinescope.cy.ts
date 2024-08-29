const testApiTokenName = 'Test Token';
const projectsUrl = 'https://api.kinescope.io/v1/projects'
const uploadVideoUrl = 'https://uploader.kinescope.io/v2/video';
const videoTitle = 'Test Video Title';
const videoUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';
const getVideoUrl = 'https://api.kinescope.io/v1/videos/';
let authToken: string;
let projectId: string;
let videoId: string;

describe('Kinescope UI Авторизация и создание токена', () => {
  beforeEach(() => {
    //Шаг 1: Авторизация в личном кабинете.
    cy.visit('');
    cy.get('input[placeholder="Work email"]').type(Cypress.env('USERNAME'));
    cy.get('input[type="password"]').type(Cypress.env('PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
  });

  it('Проверка что авторизация прошла успешно', () => {
    //Шаг 2: Проверяем существование приложения с проектами.
    cy.get('div[id="dashboard-app"]').should('exist');
  })

  it('Создание API токена', () => {
    // Шаг 2: Создаем новый API токен.
    cy.visit('/workspace/api_token');
    cy.get('button:has(span:contains("Новый токен"))').click();
    cy.get('input[placeholder="Введите название токена"]').type(testApiTokenName);
    cy.get('div').contains('Загружать файлы').click();
    cy.get('button[type="submit"]').click();

    // Шаг 3: Проверяем, что токен создан успешно.
    cy.get('div').contains(testApiTokenName).should('exist');
    cy.get('div').contains('Разрешения: этот токен может загружать файлы').should('exist');

    // Шаг 4: Получаем значение токена
    cy.get('svg:has(path[d="M8 0a3 3 0 0 0-3 3v.05a1 1 0 0 0 2 0V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1 1 1 0 1 0 0 2 3 3 0 0 0 3-3V3a3 3 0 0 0-3-3H8ZM3 5a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H3ZM2 8a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8Z"])').click({ multiple: true });
    cy.window().then((win) => {
      return win.navigator.clipboard.readText();
    }).then((text) => {
      authToken = text;
    });
  });
});

describe('Kinescope API Загрузка видео в проект', () => {
  it('Получение проектов', () => {
    //Шаг 1: Отправляем GET запрос чтобы узнать id проекта.
    cy.request({
      method: 'GET',
      url: projectsUrl,
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      failOnStatusCode: false
    }).then((response) => {
      //Шаг 2: Проверяем что проекты есть.
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an('array').that.is.not.empty;

      //Шаг 3: Парсим id проекта в переменную projectId чтобы использовать в следующих запросах.
      const projects = response.body.data;

      projects.forEach((project: { id: string; }) => {
        projectId = project.id;
      });
    });
  });

  it('Загрузка видео по URL', () => {
    //Шаг 1: Отправляем POST запрос чтобы загрузить видео.
    cy.request({
      method: 'POST',
      url: uploadVideoUrl,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Parent-ID': projectId,
        'X-Video-Title': videoTitle,
        'X-Video-URL': videoUrl
      },
      failOnStatusCode: false
    }).then((response) => {
      //Шаг 2: Проверяем что видео загрузилось.
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('id');

      //Шаг 3: Парсим id видео в переменную videoId чтобы использовать в следующих запросах.
      videoId = response.body.data.id;
    });
  });

  it('Проверка наличия видео', () => {
    //Шаг 1: Отправляем POST запрос чтобы загрузить видео.
    cy.request({
      method: 'GET',
      url: getVideoUrl + videoId,
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      failOnStatusCode: false
    }).then((response) => {
      //Шаг 2: Проверяем что видео есть в списке видео.
      expect(response.status).to.eq(200);
      expect(response.body.data.id).equals(videoId);
      expect(response.body.data.title).equals(videoTitle);
    });
  })
});

describe('Kinescope UI Проверка отображения загруженного видео', () => {
  before(() => {
    //Шаг 1: Авторизация в личном кабинете.
    cy.visit('');
    cy.get('input[placeholder="Work email"]').type(Cypress.env('USERNAME'));
    cy.get('input[type="password"]').type(Cypress.env('PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
  });

  it('Проверка что авторизация прошла успешно', () => {
    //Шаг 2: Проверяем существование видео в проекте.
    cy.get('div[id="dashboard-app"]').should('exist');
    cy.get(`div:has(span:contains("${videoTitle}"))`);
  })
});