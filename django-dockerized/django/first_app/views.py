from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse, Http404

from .models import Question
from .models import Choice


def index(request):
    return render(request, "first_app/index.html", {})


def questions(request):
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    template = loader.get_template("first_app/questions.html")
    context = {
        "latest_question_list": latest_question_list,
    }
    return HttpResponse(template.render(context, request))


def detail(request, question_id):
    try:
        question = Question.objects.get(pk=question_id)
        choices = Choice.objects.filter(question__pk=question_id)
    except Question.DoesNotExist:
        raise Http404("Question does not exist")
    return render(
        request, "first_app/detail.html", {"question": question, "choices": choices}
    )


def vote(request, choice_id):
    choice = Choice.objects.get(pk=choice_id)
    choice.votes += 1
    choice.save()
    return HttpResponse("you've voted!")
