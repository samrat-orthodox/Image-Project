from __future__ import absolute_import
import os
from celery import Celery
from django.conf import settings
from celery.task import Task

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'image.settings')
app = Celery('image')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

app.conf.update(
    CELERY_RESULT_BACKEND='djcelery.backends.database:DatabaseBackend',
)

app.conf.update(
    CELERY_RESULT_BACKEND='djcelery.backends.cache:CacheBackend',
)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))


# implement the interface for celery Task
class CallbackTask(Task):
    # no current tasks to do after success
    def on_success(self, retval, task_id, args, kwargs):
        pass

    # failure not handled currently
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        pass
