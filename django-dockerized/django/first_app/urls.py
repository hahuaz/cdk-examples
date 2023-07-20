from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("questions/", views.questions, name="questions"),
    path("questions/<int:question_id>/", views.detail, name="detail"),
    # TODO use POST method for voting and make ajax request from client
    path("choices/<int:choice_id>/", views.vote, name="vote"),
]
