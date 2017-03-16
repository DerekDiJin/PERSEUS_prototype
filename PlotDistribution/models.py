
from django.db import models

# Create your models here.

class Node(models.Model):
	nodeId = models.CharField(default= 0, max_length=30, primary_key=True)
	inoutdegree = models.CharField(default= 0, max_length=30, db_index=True)
	pagerank = models.CharField(default= 0, max_length=30, db_index=True)
	ev1 = models.CharField(default= 0, max_length=30, db_index=True)
	ev2 = models.CharField(default= 0, max_length=30, db_index=True)
	ev3 = models.CharField(default= 0, max_length=30, db_index=True)
	ev4 = models.CharField(default= 0, max_length=30, db_index=True)
	ev1_t = models.CharField(default= 0, max_length=30, db_index=True)
	ev2_t = models.CharField(default= 0, max_length=30, db_index=True)
	ev3_t = models.CharField(default= 0, max_length=30, db_index=True)
	ev4_t = models.CharField(default= 0, max_length=30, db_index=True)
	inoutdegree_t = models.CharField(default= 0, max_length=30, db_index=True)
	pagerank_t = models.CharField(default= 0, max_length=30, db_index=True)
	anomalyScore0 = models.CharField(default= 0, max_length=30, db_index=True)
	anomalyScore8 = models.CharField(default= 0, max_length=30, db_index=True)
	anomalyScore16 = models.CharField(default= 0, max_length=30, db_index=True)
	anomalyScore32 = models.CharField(default= 0, max_length=30, db_index=True)
	pagerank_dist = models.CharField(default= 0, max_length=30, db_index=True)
	# fl_prob = models.CharField(default= 0, max_length=30, db_index=True)
	# or_prob = models.CharField(default= 0, max_length=30, db_index=True)
	cc_dist = models.CharField(default= 0, max_length=30, db_index=True)
	inoutdegree_u = models.CharField(default= 0, max_length=30, db_index=True)
	pagerank_u = models.CharField(default= 0, max_length=30, db_index=True)
	inoutdegree_u_t = models.CharField(default= 0, max_length=30, db_index=True)
	inoutdegree_w_t = models.CharField(default= 0, max_length=30, db_index=True)
	pagerank_u_t = models.CharField(default= 0, max_length=30, db_index=True)
	pagerank_w_t = models.CharField(default= 0, max_length=30, db_index=True)


class ccCount(models.Model):
	ccIndex = models.CharField(default= 0, max_length=30, db_index=True)
	count = models.IntegerField(default= 0, db_index=True)

class lookup(models.Model):
	number = models.CharField(default= 0, max_length=30, db_index=True)
	nodeId = models.CharField(default= 0, max_length=30, db_index=True)

class IndegreeCount(models.Model):
	indegree = models.IntegerField(default= 0)
	count = models.IntegerField(default= 0)

class OutdegreeCount(models.Model):
	outdegree = models.IntegerField(default= 0)
	count = models.IntegerField(default= 0)

class InoutdegreeCount(models.Model):
	inoutdegree = models.IntegerField(default= 0, db_index=True)
	count = models.IntegerField(default= 0, db_index=True)

class PagerankCount(models.Model):
	pagerank = models.CharField(default= 0, max_length=30, db_index=True)
	count = models.IntegerField(default= 0, db_index=True)
	
class Edge(models.Model):
	fromNode = models.IntegerField(default= 0, db_index=True)
	toNode = models.IntegerField(default= 0, db_index=True)
	weight = models.IntegerField(default= 0, db_index=True)

class NodeIndegree(models.Model):
	node = models.IntegerField(default= 0)
	indegree = models.IntegerField(default= 0)

class NodeOutdegree(models.Model):
	node = models.IntegerField(default= 0)
	outdegree = models.IntegerField(default= 0)

class NodeInoutdegree(models.Model):
	node = models.IntegerField(default= 0)
	inoutdegree = models.IntegerField(default= 0)

class NodePagerank(models.Model):
	node = models.IntegerField(default= 0)
	pagerank = models.FloatField(default= 0)
