import { useEffect } from 'react';

interface AnalyticsEvent {
  session_id: string;
  action_type: string;
  action_details?: Record<string, any>;
  page_url?: string;
  referrer?: string;
}

const ANALYTICS_ENDPOINT = 'https://functions.poehali.dev/90baacc3-9672-4e72-8453-a68fc83256e2';

// Генерируем уникальный ID сессии
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Функция для отправки события
const trackEvent = async (event: Omit<AnalyticsEvent, 'session_id'>) => {
  try {
    const analyticsEvent: AnalyticsEvent = {
      session_id: getSessionId(),
      page_url: window.location.href,
      referrer: document.referrer,
      ...event,
    };

    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsEvent),
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

// Хук для автоматического трекинга просмотров страниц
export const usePageTracking = () => {
  useEffect(() => {
    // Трекаем просмотр страницы
    trackEvent({
      action_type: 'page_view',
      action_details: {
        title: document.title,
        path: window.location.pathname,
        search: window.location.search,
      },
    });

    // Трекаем время начала сессии
    const startTime = Date.now();

    // Функция для трекинга времени на странице при уходе
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      trackEvent({
        action_type: 'page_exit',
        action_details: {
          time_spent_ms: timeSpent,
          path: window.location.pathname,
        },
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

// Хук для трекинга кликов по элементам
export const useClickTracking = () => {
  const trackClick = (elementType: string, elementText?: string, additionalData?: Record<string, any>) => {
    trackEvent({
      action_type: 'click',
      action_details: {
        element_type: elementType,
        element_text: elementText,
        ...additionalData,
      },
    });
  };

  return { trackClick };
};

// Хук для трекинга скроллинга
export const useScrollTracking = () => {
  useEffect(() => {
    let maxScrollPercentage = 0;
    const checkpoints = [25, 50, 75, 100];
    const reachedCheckpoints = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

      if (scrollPercentage > maxScrollPercentage) {
        maxScrollPercentage = scrollPercentage;
      }

      // Трекаем достижение контрольных точек
      checkpoints.forEach(checkpoint => {
        if (scrollPercentage >= checkpoint && !reachedCheckpoints.has(checkpoint)) {
          reachedCheckpoints.add(checkpoint);
          trackEvent({
            action_type: 'scroll_checkpoint',
            action_details: {
              checkpoint_percent: checkpoint,
              path: window.location.pathname,
            },
          });
        }
      });
    };

    const handleBeforeUnload = () => {
      if (maxScrollPercentage > 0) {
        trackEvent({
          action_type: 'scroll_summary',
          action_details: {
            max_scroll_percent: maxScrollPercentage,
            path: window.location.pathname,
          },
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

// Хук для трекинга форм
export const useFormTracking = () => {
  const trackFormStart = (formName: string) => {
    trackEvent({
      action_type: 'form_start',
      action_details: {
        form_name: formName,
      },
    });
  };

  const trackFormSubmit = (formName: string, success: boolean, errorMessage?: string) => {
    trackEvent({
      action_type: 'form_submit',
      action_details: {
        form_name: formName,
        success,
        error_message: errorMessage,
      },
    });
  };

  const trackFormAbandonment = (formName: string, fieldsCompleted: number, totalFields: number) => {
    trackEvent({
      action_type: 'form_abandonment',
      action_details: {
        form_name: formName,
        fields_completed: fieldsCompleted,
        total_fields: totalFields,
        completion_percentage: Math.round((fieldsCompleted / totalFields) * 100),
      },
    });
  };

  return { trackFormStart, trackFormSubmit, trackFormAbandonment };
};

export default {
  usePageTracking,
  useClickTracking,
  useScrollTracking,
  useFormTracking,
  trackEvent,
};