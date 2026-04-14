import { Page, Route } from '@playwright/test';

function okJson(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function gatewayHandler(route: Route): Promise<void> {
  const request = route.request();
  const url = new URL(request.url());

  if (url.pathname === '/legal-ai/model-summary') {
    return okJson(route, {
      model_type: 'tfidf_logistic_regression',
      training_sample_count: 120,
      gold_sample_count: 18,
      cross_validation: {
        accuracy: 0.81,
        macro_f1: 0.8,
        confusion_matrix: [
          [4, 1, 1],
          [1, 4, 1],
          [0, 1, 5],
        ],
        per_class_metrics: {
          low: { precision: 0.8, recall: 0.7, f1: 0.75, support: 6 },
          medium: { precision: 0.75, recall: 0.8, f1: 0.77, support: 6 },
          high: { precision: 0.83, recall: 0.83, f1: 0.83, support: 6 },
        },
      },
      gold_evaluation: {
        accuracy: 0.78,
        macro_f1: 0.76,
        confusion_matrix: [
          [4, 1, 1],
          [1, 4, 1],
          [0, 1, 5],
        ],
        per_class_metrics: {
          low: { precision: 0.8, recall: 0.7, f1: 0.75, support: 6 },
          medium: { precision: 0.75, recall: 0.8, f1: 0.77, support: 6 },
          high: { precision: 0.83, recall: 0.83, f1: 0.83, support: 6 },
        },
      },
      global_feature_importance: [
        { risk_label: 'high', features: [{ term: 'without notice', mean_abs_shap: 0.42 }] },
        { risk_label: 'medium', features: [{ term: 'as needed', mean_abs_shap: 0.31 }] },
        { risk_label: 'low', features: [{ term: 'written notice', mean_abs_shap: 0.28 }] },
      ],
    });
  }

  if (url.pathname === '/legal-ai/analyze' && request.method() === 'POST') {
    return okJson(route, {
      risk_label: 'high',
      class_probabilities: { low: 0.04, medium: 0.14, high: 0.82 },
      needs_human_review: true,
      top_features_supporting_prediction: [
        { term: 'without notice', shap_value: 0.42 },
        { term: 'monitor', shap_value: 0.39 },
      ],
      top_features_against_prediction: [
        { term: 'written notice', shap_value: -0.21 },
      ],
      plain_english_explanation:
        'This text is high risk because it suggests unrestricted monitoring and lack of notice.',
      openai_commentary: null,
    });
  }

  if (url.pathname === '/legal-ai/ping') {
    return okJson(route, {
      service_name: 'legal_ai_service',
      status: 'ok',
      message: 'Employment compliance risk analysis routes are reachable.',
      reserved_routes: ['/legal-ai/ping', '/legal-ai/model-summary', '/legal-ai/analyze'],
    });
  }

  if (url.pathname.endsWith('/health')) {
    return okJson(route, { status: 'ok' });
  }

  return okJson(route, {});
}

export async function mockGatewayApis(page: Page): Promise<void> {
  await page.route('http://127.0.0.1:8000/**', gatewayHandler);
  await page.route('http://localhost:8000/**', gatewayHandler);
}

export async function installDeterministicUiStyle(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
}
