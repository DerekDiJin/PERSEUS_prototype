from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    # Examples:
    # url(r'^$', 'visualize.views.home', name='home'),
    url(r'^PlotDistribution/', include('PlotDistribution.urls')),
    url(r'^admin/', include(admin.site.urls)),

]
