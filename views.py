from django.shortcuts import render
from django.http import HttpResponse
from django.db import connections
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import ConnectionDoesNotExist  
from django.db.models import F
from django.db.models import Q
import PlotDistribution
from PlotDistribution.models import *
from PlotDistribution.models import PagerankCount
from PlotDistribution.models import lookup
from PlotDistribution.models import ccCount
from sets import Set
import os
import time
import string
import random
import json
from string import atof

# Create your views here.
previousNodeID = 0
storedNodes =  []

def home(request):
	return render(request,"PlotDistribution/index.html", {})

def Plot(request):
	return render(request, "PlotDistribution/Plot.html", {})

def DBPlot(request):
	return render(request, "PlotDistribution/DBPlot.html", {})

def MultiPlots(request):
	return render(request, "PlotDistribution/MultiPlots.html", {})

def MultiPlots_test(request):
	return render(request, "PlotDistribution/MultiPlots_test.html", {})

def MultiPlots_soc_Slashdot0811(request):
	return render(request, "PlotDistribution/MultiPlots_soc_Slashdot0811.html", {})

def MultiPlots_soc_Slashdot0811_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_soc_Slashdot0811_HeatMap.html", {})

def MultiPlots_soc_Slashdot0902(request):
	return render(request, "PlotDistribution/MultiPlots_soc_Slashdot0902.html", {})	

def MultiPlots_soc_Slashdot0902_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_soc_Slashdot0902_HeatMap.html", {})	

def MultiPlots_wiki_Vote(request):
	return render(request, "PlotDistribution/MultiPlots_wiki_Vote.html", {})

def MultiPlots_wiki_Vote_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_wiki_Vote_HeatMap.html", {})

def MultiPlots_tmp_ID_processed(request):
	return render(request, "PlotDistribution/MultiPlots_tmp_ID_processed.html", {})

def MultiPlots_tmp_ID_processed_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_tmp_ID_processed_HeatMap.html", {})

def MultiPlots_tmp1_ID_processed(request):
	return render(request, "PlotDistribution/MultiPlots_tmp1_ID_processed.html", {})

def MultiPlots_tmp1_ID_processed_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_tmp1_ID_processed_HeatMap.html", {})

def MultiPlots_tmp2_ID_processed(request):
	return render(request, "PlotDistribution/MultiPlots_tmp2_ID_processed.html", {})

def MultiPlots_tmp2_ID_processed_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_tmp2_ID_processed_HeatMap.html", {})

def MultiPlots_tmp2_ID_final_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_tmp2_ID_final_HeatMap.html", {})

def MultiPlots_phonePage_edge_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_phonePage_edge_HeatMap.html", {})

def MultiPlots_phonePage_edge_w_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_phonePage_edge_w_HeatMap.html", {})

def MultiPlots_mon_1_rt_p_reorder_HeatMap(request):
	return render(request, "PlotDistribution/MultiPlots_mon_1_rt_p_reorder_HeatMap.html", {})

def Heatmap(request):
	return render(request, "PlotDistribution/Heatmap.html", {})

def Egonet(request):
	return render(request, "PlotDistribution/Egonet.html", {})

def searchNumberById(request):
	nodeid = int(request.GET.get('nodeid',0))
	print (nodeid)
	
	response_data = {}
	entry = lookup.objects.get(nodeId = nodeid)
	response_data['number'] = entry.number
	
	return HttpResponse(json.dumps(response_data), content_type="application/json")




def searchById(request):
	nodeid = int(request.GET.get('nodeid',0))
	print (nodeid)
	
	response_data = {}
	response_data['degreePagerank_HeatMap'] = ''
	response_data['ev1ev2_HeatMap'] = ''
	response_data['ev2ev3_HeatMap'] = ''
	response_data['ev3ev4_HeatMap'] = ''
	response_data['degreeCount_HeatMap'] = ''
	response_data['pageRankCount_HeatMap'] = ''
	response_data['degreeUW_HeatMap'] = ''
	response_data['pagerankUW_HeatMap'] = ''
	response_data['ccCount_HeatMap'] = ''
	
	theNode = Node.objects.get(nodeId = nodeid)
	
	degreeCount = str(theNode.inoutdegree) + '\t' + str(InoutdegreeCount.objects.get(inoutdegree=theNode.inoutdegree).count)
	degreePagerank = str(theNode.inoutdegree_t) + '\t' + theNode.pagerank_t
	pagerankCount = theNode.pagerank_dist + '\t' + str(PagerankCount.objects.get(pagerank=theNode.pagerank_dist).count)
	ev1ev2 = theNode.ev1_t + '\t' + theNode.ev2_t
	ev2ev3 = theNode.ev2_t + '\t' + theNode.ev3_t
	ev3ev4 = theNode.ev3_t + '\t' + theNode.ev4_t
	degreeUW = str(theNode.inoutdegree_u_t) + '\t' + str(theNode.inoutdegree_w_t)
	pagerankUW = str(theNode.pagerank_u_t) + '\t' + str(theNode.pagerank_w_t)
	trou = theNode.cc_dist + '\t' + str(ccCount.objects.get(ccIndex=str(theNode.cc_dist)).count)

	print (degreeCount, degreePagerank, pagerankCount, ev1ev2, ev2ev3, ev3ev4)
	
	response_data['degreePagerank_HeatMap'] = response_data['degreePagerank_HeatMap'] + degreePagerank + ';'
	response_data['degreeCount_HeatMap'] = response_data['degreeCount_HeatMap'] + degreeCount + ';'
	response_data['pageRankCount_HeatMap'] = response_data['pageRankCount_HeatMap'] + pagerankCount + ';'
	response_data['ev1ev2_HeatMap'] = response_data['ev1ev2_HeatMap'] + ev1ev2 + ';'
	response_data['ev2ev3_HeatMap'] = response_data['ev2ev3_HeatMap'] + ev2ev3 + ';'
	response_data['ev3ev4_HeatMap'] = response_data['ev3ev4_HeatMap'] + ev3ev4 + ';'

	response_data['degreeUW_HeatMap'] = response_data['degreeUW_HeatMap'] + degreeUW + ';'
	response_data['pagerankUW_HeatMap'] = response_data['pagerankUW_HeatMap'] + pagerankUW + ';'
	response_data['ccCount_HeatMap'] = response_data['ccCount_HeatMap'] + trou + ';'
	
	return HttpResponse(json.dumps(response_data), content_type="application/json")

def searchByNumber(request):


	number = str(request.GET.get('number',0))

	theNumber = lookup.objects.get(number = number)
	nodeid = theNumber.nodeId
	
	response_data = {}
	response_data['degreePagerank_HeatMap'] = ''
	response_data['ev1ev2_HeatMap'] = ''
	response_data['ev2ev3_HeatMap'] = ''
	response_data['ev3ev4_HeatMap'] = ''
	response_data['degreeCount_HeatMap'] = ''
	response_data['pageRankCount_HeatMap'] = ''
	response_data['degreeUW_HeatMap'] = ''
	response_data['pagerankUW_HeatMap'] = ''
	response_data['ccCount_HeatMap'] = ''
	
	theNode = Node.objects.get(nodeId = nodeid)
	
	degreeCount = str(theNode.inoutdegree) + '\t' + str(InoutdegreeCount.objects.get(inoutdegree=theNode.inoutdegree).count)
	degreePagerank = str(theNode.inoutdegree_t) + '\t' + theNode.pagerank_t
	pagerankCount = theNode.pagerank_dist + '\t' + str(PagerankCount.objects.get(pagerank=theNode.pagerank_dist).count)
	ev1ev2 = theNode.ev1_t + '\t' + theNode.ev2_t
	ev2ev3 = theNode.ev2_t + '\t' + theNode.ev3_t
	ev3ev4 = theNode.ev3_t + '\t' + theNode.ev4_t

	degreeUW = str(theNode.inoutdegree_u_t) + '\t' + str(theNode.inoutdegree_w_t)
	pagerankUW = str(theNode.pagerank_u_t) + '\t' + str(theNode.pagerank_w_t)
	trou = theNode.cc_dist + '\t' + str(ccCount.objects.get(ccIndex=str(theNode.cc_dist)).count)
	
	
	response_data['degreePagerank_HeatMap'] = response_data['degreePagerank_HeatMap'] + degreePagerank + ';'
	response_data['degreeCount_HeatMap'] = response_data['degreeCount_HeatMap'] + degreeCount + ';'
	response_data['pageRankCount_HeatMap'] = response_data['pageRankCount_HeatMap'] + pagerankCount + ';'
	response_data['ev1ev2_HeatMap'] = response_data['ev1ev2_HeatMap'] + ev1ev2 + ';'
	response_data['ev2ev3_HeatMap'] = response_data['ev2ev3_HeatMap'] + ev2ev3 + ';'
	response_data['ev3ev4_HeatMap'] = response_data['ev3ev4_HeatMap'] + ev3ev4 + ';'

	response_data['degreeUW_HeatMap'] = response_data['degreeUW_HeatMap'] + degreeUW + ';'
	response_data['pagerankUW_HeatMap'] = response_data['pagerankUW_HeatMap'] + pagerankUW + ';'
	response_data['ccCount_HeatMap'] = response_data['ccCount_HeatMap'] + trou + ';'
	
	return HttpResponse(json.dumps(response_data), content_type="application/json")
		


def DeleteMatrixFiles(request):
	curPath = os.getcwd()
	edgeFilePath = curPath + '/visualize/PlotDistribution/static/edgeMatrix.csv'
	nodeFilePath = curPath + '/visualize/PlotDistribution/static/nodeMatrix.csv'
	try:
		os.remove(edgeFilePath)
		os.remove(nodeFilePath)
	except OSError:
		pass
	resultStr = 'Delete Done'
	return HttpResponse(resultStr, content_type="text/plain")

def AdjShowReverse(request):
	nodeid = int(request.GET.get('nodeid',0))
	
	response_data = {}
	response_data['degreePagerank_HeatMap'] = ''
	response_data['ev1ev2_HeatMap'] = ''
	response_data['ev2ev3_HeatMap'] = ''
	response_data['ev3ev4_HeatMap'] = ''
	response_data['degreeCount_HeatMap'] = ''
	response_data['pageRankCount_HeatMap'] = ''
	response_data['degreeUW_HeatMap'] = ''
	response_data['pagerankUW_HeatMap'] = ''
	response_data['ccCount_HeatMap'] = ''
	
	theNode = Node.objects.get(nodeId = nodeid)
	
	degreeCount = str(theNode.inoutdegree) + '\t' + str(InoutdegreeCount.objects.get(inoutdegree=theNode.inoutdegree).count)
	degreePagerank = str(theNode.inoutdegree_t) + '\t' + theNode.pagerank_t
	pagerankCount = theNode.pagerank_dist + '\t' + str(PagerankCount.objects.get(pagerank=theNode.pagerank_dist).count)
	ev1ev2 = theNode.ev1_t + '\t' + theNode.ev2_t
	ev2ev3 = theNode.ev2_t + '\t' + theNode.ev3_t
	ev3ev4 = theNode.ev3_t + '\t' + theNode.ev4_t
	degreeUW = str(theNode.inoutdegree_u_t) + '\t' + str(theNode.inoutdegree_w_t)
	pagerankUW = str(theNode.pagerank_u_t) + '\t' + str(theNode.pagerank_w_t)
	trou = theNode.cc_dist + '\t' + str(ccCount.objects.get(ccIndex=str(theNode.cc_dist)).count)
	
	
	response_data['degreePagerank_HeatMap'] = response_data['degreePagerank_HeatMap'] + degreePagerank + ';'
	response_data['degreeCount_HeatMap'] = response_data['degreeCount_HeatMap'] + degreeCount + ';'
	response_data['pageRankCount_HeatMap'] = response_data['pageRankCount_HeatMap'] + pagerankCount + ';'
	response_data['ev1ev2_HeatMap'] = response_data['ev1ev2_HeatMap'] + ev1ev2 + ';'
	response_data['ev2ev3_HeatMap'] = response_data['ev2ev3_HeatMap'] + ev2ev3 + ';'
	response_data['ev3ev4_HeatMap'] = response_data['ev3ev4_HeatMap'] + ev3ev4 + ';'

	response_data['degreeUW_HeatMap'] = response_data['degreeUW_HeatMap'] + degreeUW + ';'
	response_data['pagerankUW_HeatMap'] = response_data['pagerankUW_HeatMap'] + pagerankUW + ';'
	response_data['ccCount_HeatMap'] = response_data['ccCount_HeatMap'] + trou + ';'
	
	return HttpResponse(json.dumps(response_data), content_type="application/json")

def GetEgonet(request):
	global previousNodeID
	global storedNodes
	print ("enter GetEgonet")
	start_time = time.time()
	resultStr = ""
	nodeid = int(request.GET.get('nodeid',0))
	print (nodeid)
	outedges = Edge.objects.filter(fromNode = nodeid)
	inedges = Edge.objects.filter(toNode = nodeid)
	nodes = set()
	nodes_ego = set()

	# nodes = Set([nodeid])
	for oe in outedges:
		nodes.add(oe.toNode)
	for ie in inedges:
		nodes.add(ie.fromNode)
	nodes.add(nodeid)
	print len(nodes)
		
	sampleNum = 10
	#mark.#
	if previousNodeID != nodeid:
		pagerankDict = dict()
		for curNode in nodes:
			curNode_pagerankList = Node.objects.filter(nodeId = curNode)
			for temp in curNode_pagerankList:
				curNode_pagerank = atof(temp.pagerank)
			pagerankDict.update({curNode: curNode_pagerank})
		
		pagerankDict_Sorted = sorted(pagerankDict.iteritems(), key=lambda d:d[1], reverse = True)
		
		pagerankDict_Sorted_List = []
		for temp in pagerankDict_Sorted:
			pagerankDict_Sorted_List.append(temp[0])
		
		storedNodes = pagerankDict_Sorted_List			
	
	else:
		pagerankDict_Sorted_List = storedNodes[sampleNum:]
		storedNodes = storedNodes[sampleNum:]
	
	
	# sample the neighbor for egonet
	if len(pagerankDict_Sorted_List) > sampleNum:
		#nodes = random.sample(nodes,sampleNum)
		nodes_ego = pagerankDict_Sorted_List[:sampleNum]
		nodes_ego.append(nodeid)
	else:
		nodes_ego = pagerankDict_Sorted_List

	validEdges_selected = Edge.objects.filter(fromNode__in=nodes_ego, toNode__in=nodes_ego)
	for e in validEdges_selected:
		resultStr = resultStr + str(e.fromNode) + "\t" + str(e.toNode)+ "\t" + str(e.weight) + "\n"

	
# # --> 	#### write to ego adjacency matrix file ####
# 	if len(pagerankDict_Sorted_List) > adjNumMax:
# 		nodes_adj = pagerankDict_Sorted_List[:adjNumMax]
# 	else:
# 		nodes_adj = pagerankDict_Sorted_List
	
# # 	nodes_adj.append(nodeid)
# 	validEdges = Edge.objects.filter(fromNode__in=nodes_adj, toNode__in=nodes_adj)
# 	print "writing starts"
	
# 	curPath = os.getcwd()
# 	edgeFilePath = curPath + '/visualize/PlotDistribution/static/edgeMatrix.csv'
# 	print edgeFilePath
# 	try:
# 		os.remove(edgeFilePath)
# 	except OSError:
# 		pass
# 	edgeFIn = open(edgeFilePath, 'w')
# 	edgeFIn.write('source,target,weight\n')
# 	for ele in validEdges:
# 		line =  str(ele.fromNode) + "," + str(ele.toNode)+ ",1\n"
# 		edgeFIn.write(line)
	
# 	nodeFilePath = curPath + '/visualize/PlotDistribution/static/nodeMatrix.csv'
# 	try:
# 		os.remove(nodeFilePath)
# 	except OSError:
# 		pass
# 	nodeFIn = open(nodeFilePath, 'w')
# 	nodeFIn.write('id,followers,following\n')
# 	for ele in nodes_adj:
# 		nodeFIn.write(str(ele) + ',100,200\n')
	
# 	print 'Write complete.'
# # -->
	
	previousNodeID = nodeid
	print("--- %s seconds ---" % str(time.time() - start_time))
	return HttpResponse(resultStr, content_type="text/plain")


def GetAdj(request):
	print ("enter GetAdj")
	adjNumMax = 100
	start_time = time.time()
	resultStr = ""
	nodeid = int(request.GET.get('nodeid',0))
	print (nodeid)
	nodes = set()
	outedges = Edge.objects.filter(fromNode = nodeid)
	inedges = Edge.objects.filter(toNode = nodeid)
	
	for oe in outedges:
		nodes.add(oe.toNode)
	for ie in inedges:
		nodes.add(ie.fromNode)
	nodes.add(nodeid)


	pagerankDict = dict()
	for curNode in nodes:
		curNode_pagerankList = Node.objects.filter(nodeId = curNode)
		for temp in curNode_pagerankList:
			curNode_pagerank = atof(temp.pagerank) #temp.pagerank
		pagerankDict.update({curNode: curNode_pagerank})
		
	pagerankDict_Sorted = sorted(pagerankDict.iteritems(), key=lambda d:d[1], reverse = True)
		
	pagerankDict_Sorted_List = []
	for temp in pagerankDict_Sorted:
		pagerankDict_Sorted_List.append(temp[0])
		
	pagerankDict_Sorted_List


	if len(pagerankDict_Sorted_List) > adjNumMax:
		nodes_adj = pagerankDict_Sorted_List[:adjNumMax]
	else:
		nodes_adj = pagerankDict_Sorted_List


	validEdges = Edge.objects.filter(fromNode__in=nodes_adj, toNode__in=nodes_adj)
	print ("writing starts")

	response_data = {}
	response_data['edges'] = ''
	response_data['nodes_src'] = ''
	response_data['nodes_dst'] = ''

	for ele in validEdges:
		response_data['edges'] = response_data['edges'] + str(ele.fromNode) + "\t" + str(ele.toNode)+ ";"

	##########-->########
	for ele in validEdges:
		response_data['edges'] = response_data['edges'] + str(ele.toNode) + "\t" + str(ele.fromNode)+ ";"
	
	for ele in nodes_adj:
		response_data['nodes_src'] = response_data['nodes_src'] + str(ele) + ';'
		
	for ele in nodes_adj:
		response_data['nodes_dst'] = response_data['nodes_dst'] + str(ele) + ';'
	
	print ('Write complete.')
	print("--- %s seconds ---" % str(time.time() - start_time))
	return HttpResponse(json.dumps(response_data), content_type="application/json")


def GetPlotData(request):
	dataCount = {}
	nodes = Node.objects.all()
	for node in nodes:
		key = str(node.inoutdegree)+'\t'+str(node.pagerank)
		if key in dataCount:
			dataCount[key] = dataCount[key] + 1
		else:
			dataCount[key] = 1
	resultStr = ""
	for key in dataCount:
		resultStr = resultStr + key + "\t" + str(dataCount[key])+ "\n"
	return HttpResponse(resultStr, content_type="text/plain")

# def Update(request):
# 	plot = int(request.GET.get('plot',0))
# 	x = int(request.GET.get('x',0))
# 	y = int(request.GET.get('y',0))
# 	print plot, x, y
# 	resultStr = "";
# 	if plot == 1:
# 		print "click on plot 1"
# 		nodes = NodeIndegree.objects.filter(indegree = x)
# 		print len(nodes)
# 		for n in nodes:
# 			# print n.node
# 			try:
# 				correspondingNode = NodeOutdegree.objects.get(node = n.node)
# 				try:
# 					outDCount = OutdegreeCount.objects.get(outdegree = correspondingNode.outdegree)
# 					resultStr = resultStr + str(outDCount.outdegree) + "\t" + str(outDCount.count)+ ";"
# 				except RankOutdegree.DoesNotExist:
# 					resultStr = ""
# 			except NodeOutdegree.DoesNotExist:
# 				# outdegree = 0
# 				resultStr = ""
# 	else:
# 		print "click on plot 2"
# 		nodes = NodeOutdegree.objects.filter(outdegree = x)
# 		print len(nodes)
# 		for n in nodes:
# 			# print n.node
# 			try:
# 				correspondingNode = NodeIndegree.objects.get(node = n.node)
# 				try:
# 					inDCount = IndegreeCount.objects.get(indegree = correspondingNode.indegree)
# 					resultStr = resultStr + str(inDCount.indegree) + "\t" + str(inDCount.count)+ ";"
# 				except RankIndegree.DoesNotExist:
# 					resultStr = ""
# 			except NodeIndegree.DoesNotExist:
# 				# indegree = 0
# 				resultStr = ""
# 	print resultStr		
# 	return HttpResponse(resultStr, content_type="text/plain")


def ShowAnomalies(request):
	plot = request.GET.get('plot', 0)
	x = request.GET.get('x', 0)
	y = request.GET.get('y', 0)
	print (plot, x, y)
	
	response_data = ""
	
	if plot == "degreeCount":
		response_data = plot + '\t' + x + '\t' + y
	elif plot == "radiusCount":
		response_data = plot + '\t' + x + '\t' + y
	elif plot == "degreeRadius":
		response_data = plot + '\t' + x + '\t' + y
	elif plot == "degreePagerank":
		nodes = Node.objects.filter(inoutdegree = x, pagerank = y)
		print (len(nodes))
		response_data = plot + '\t' + nodes[0].inoutdegree_t + '\t' + nodes[0].pagerank_t
	elif plot == "ev1ev2":
		nodes = Node.objects.filter(ev1 = x, ev2 = y)
		print (len(nodes))
		response_data = plot + '\t' + nodes[0].ev1_t + '\t' + nodes[0].ev2_t
	elif plot == "ev2ev3":
		nodes = Node.objects.filter(ev2 = x, ev3 = y)
		print len(nodes)
		response_data = plot + '\t' + nodes[0].ev2_t + '\t' + nodes[0].ev3_t
	
	return HttpResponse(response_data, content_type="text/plain")

def clickShowAnomalyOverall(request):
	number = request.GET.get('number', 0)
	type = request.GET.get('type', 0)
	isHeatMap = request.GET.get('isHeatMap', 0)
	print (number)
	
	response_data = {}
	if isHeatMap == '1':
		
		response_data['degreePagerank_HeatMap'] = ''
		response_data['ev1ev2_HeatMap'] = ''
		response_data['ev2ev3_HeatMap'] = ''
		response_data['degreeCount_HeatMap'] = ''
		response_data['pageRankCount_HeatMap'] = ''
		response_data['degreeRadius_HeatMap'] = ''
		
		nodes = Node.objects.all().order_by('-' + type)[0:number]
		for n in nodes:
			#print node.anomalyScore0
			degreeCount = str(n.inoutdegree) + '\t' + str(InoutdegreeCount.objects.get(inoutdegree=n.inoutdegree).count)
			response_data['degreeCount_HeatMap'] = response_data['degreeCount_HeatMap'] + degreeCount + ';'
			
			degreePagerank = str(n.inoutdegree_t) + '\t' + n.pagerank_t
			response_data['degreePagerank_HeatMap'] = response_data['degreePagerank_HeatMap'] + degreePagerank + ';'
			
			pagerankCount = n.pagerank_dist + '\t' + str(PagerankCount.objects.get(pagerank=n.pagerank_dist).count)
			response_data['pageRankCount_HeatMap'] = response_data['pageRankCount_HeatMap'] + pagerankCount + ';'
			
			degreeRadius = str(n.inoutdegree) + '\t' + n.radius
			response_data['degreeRadius_HeatMap'] = response_data['degreeRadius_HeatMap'] + degreeRadius + ';'
			
			response_data['ev1ev2_HeatMap'] = response_data['ev1ev2_HeatMap'] + n.ev1_t + '\t' + n.ev2_t + ';'
			response_data['ev2ev3_HeatMap'] = response_data['ev2ev3_HeatMap'] + n.ev2_t + '\t' + n.ev3_t + ';'
	
	
	elif isHeatMap == '0':
		response_data['errors'] = 'Only HeatMaps should be requested, errors occur.'
	
	return HttpResponse(json.dumps(response_data), content_type="application/json")

	
	

def ClickPlot(request):
	plot = request.GET.get('plot',0)
	x = request.GET.get('x',0)
	y = request.GET.get('y',0)
	print (plot, x, y)
	isHeatMap = plot.endswith("HeatMap")
	
	response_data = {}
	
	if (isHeatMap):
		response_data['degreePagerank_HeatMap'] = ''
		response_data['ev1ev2_HeatMap'] = ''
		response_data['ev2ev3_HeatMap'] = ''
		response_data['ev3ev4_HeatMap'] = ''
		response_data['degreeCount_HeatMap'] = ''
		response_data['pageRankCount_HeatMap'] = ''
# 		response_data['fittingLine_HeatMap'] = ''
# 		response_data['or_HeatMap'] = ''
		response_data['degreeUW_HeatMap'] = ''
		response_data['pagerankUW_HeatMap'] = ''
		response_data['ccCount_HeatMap'] = ''
	else:
		response_data['errors'] = 'Only HeatMaps should be requested, errors occur.'
		return HttpResponse(json.dumps(response_data), content_type="application/json")
	
	
	response_data['sampleNodes'] = []

	degreeCountSet = set()
	degreePagerankSet = set()
	pagerankCountSet = set()
	degreeUWSet = set()
	pagerankUWSet = set()
	ccCountSet = set()


	if plot == "degreeCount_HeatMap":
		print ("click on plot degreeCount_HeatMap")
		degree = x
		nodes = Node.objects.filter(inoutdegree = degree)
		response_data['degreeCount_HeatMap'] = x + '\t' + y + ';'
	elif plot == "degreePagerank_HeatMap":
		print ("click on plot degreePagerank")
		nodes = Node.objects.filter(inoutdegree_t = x, pagerank_t = y)
		response_data['degreePagerank_HeatMap'] = x + '\t' + y + ';'
	elif plot == "pagerankCount":
		print ("click on plot pagerankCount")
		pagerank_dist = x
		nodes = Node.objects.filter(pagerank_dist = pagerank_dist)
		response_data['pagerankCount'] = x + '\t' + y + ';'
	elif plot == "pageRankCount_HeatMap":
		print ("click on plot pageRankCount_HeatMap")
		pagerank_dist = x
		nodes = Node.objects.filter(pagerank_dist = pagerank_dist)
		response_data['pageRankCount_HeatMap'] = x + '\t' + y + ';'
	elif plot == "degreeRadius_HeatMap":
		print ("click on plot degreeRadius_HeatMap")
		degree = int(x)
		radius = y
		nodes = Node.objects.filter(inoutdegree = degree, radius = radius)
		response_data['degreeRadius_HeatMap'] = x + '\t' + y + ';'	

	elif plot == "ev1ev2_HeatMap":
		print ("click on plot ev1ev2_HeatMap")
		nodes = Node.objects.filter(ev1_t = x, ev2_t = y)
		response_data['ev1ev2_HeatMap'] = x + '\t' + y + ';'
	elif plot == "ev2ev3_HeatMap":
		print ("click on plot ev2ev3_HeatMap")
		nodes = Node.objects.filter(ev2_t = x, ev3_t = y)
		response_data['ev2ev3_HeatMap'] = x + '\t' + y + ';'
	elif plot == "ev3ev4_HeatMap":
		print ("click on plot ev3ev4_HeatMap")
		nodes = Node.objects.filter(ev3_t = x, ev4_t = y)
		response_data['ev3ev4_HeatMap'] = x + '\t' + y + ';'
	
# 	elif plot == "fittingLine_HeatMap":
# 		print "click on plot fittingLine_HeatMap"
# 		nodes = Node.objects.filter(inoutdegree = x, fl_prob = y)
# 		response_data['fittingLine_HeatMap'] = x + '\t' + y + ';'
# 		
# 	elif plot == "or_HeatMap":
# 		print "click on plot or_HeatMap"
# 		nodes = Node.objects.filter(inoutdegree = x, or_prob = y)
# 		response_data['or_HeatMap'] = x + '\t' + y + ';'
		
	elif plot == "degreeUW_HeatMap":
		print ("click on plot degreeUW_HeatMap")
		nodes = Node.objects.filter(inoutdegree_u_t = x, inoutdegree_w_t = y)
		response_data['degreeUW_HeatMap'] = x + '\t' + y + ';'
	elif plot == "pagerankUW_HeatMap":
		print ("click on plot pagerankUW_HeatMap")
		nodes = Node.objects.filter(pagerank_u_t = x, pagerank_w_t = y)
		response_data['pagerankUW_HeatMap'] = x + '\t' + y + ';'
	elif plot == "ccCount_HeatMap":
		print ("click on plot ccCount_HeatMap")
		nodes = Node.objects.filter(cc_dist = x)
		response_data['ccCount_HeatMap'] = x + '\t' + y + ';'
		

	
	i = 0
	if(isHeatMap == False):
		response_data['errors'] = 'Only HeatMaps should be requested, errors occur.'
	else:
		for n in nodes:
			if i < 10:
				nodeInfo = {}
				print (n.nodeId, n.inoutdegree, n.pagerank, n.ev1, n.ev2, n.ev3, n.ev4)
				nodeInfo['nodeId'] = n.nodeId
				entries = lookup.objects.filter(nodeId = str(n.nodeId))
				for entry in entries:
					nodeInfo['number'] = entry.number
					
				nodeInfo['inoutdegree'] = n.inoutdegree
				nodeInfo['inoutdegree_u'] = n.inoutdegree_u
				
				nodeInfo['pagerank'] = n.pagerank
				nodeInfo['pagerank_u'] = n.pagerank_u
				#nodeInfo['radius'] = n.radius
				nodeInfo['pagerank_dist'] = n.pagerank_dist
				nodeInfo['ev1'] = n.ev1
				nodeInfo['ev2'] = n.ev2
				nodeInfo['ev3'] = n.ev3
				nodeInfo['ev4'] = n.ev4
# 				nodeInfo['fl_prob'] = n.fl_prob
# 				nodeInfo['or_prob'] = n.or_prob
				response_data['sampleNodes'].append(nodeInfo)
				i = i + 1
				
			if plot != "degreeCount_HeatMap":
				degreeCount = str(n.inoutdegree) + '\t' + str(InoutdegreeCount.objects.get(inoutdegree=n.inoutdegree).count)
				if degreeCount not in degreeCountSet:
					degreeCountSet.add(degreeCount)
			if plot != "degreePagerank_HeatMap":
				degreePagerank = str(n.inoutdegree_t) + '\t' + n.pagerank_t
				if degreePagerank not in degreePagerankSet:
					degreePagerankSet.add(degreePagerank)				
			if plot != "pageRankCount_HeatMap":
				print (n.pagerank_dist)
				pagerankCount = n.pagerank_dist + '\t' + str(PagerankCount.objects.get(pagerank=n.pagerank_dist).count)
				if pagerankCount not in pagerankCountSet:
					pagerankCountSet.add(pagerankCount)
# 			if plot != "degreeRadius_HeatMap":
# 				degreeRadius = str(n.inoutdegree) + '\t' + n.radius
# 				if degreeRadius not in degreeRadiusSet:
# 					degreeRadiusSet.add(degreeRadius)
			if plot != "ev1ev2_HeatMap":
				response_data['ev1ev2_HeatMap'] = response_data['ev1ev2_HeatMap'] + n.ev1_t + '\t' + n.ev2_t + ';'
			if plot != "ev2ev3_HeatMap":
				response_data['ev2ev3_HeatMap'] = response_data['ev2ev3_HeatMap'] + n.ev2_t + '\t' + n.ev3_t + ';'
			if plot != "ev3ev4_HeatMap":
				response_data['ev3ev4_HeatMap'] = response_data['ev3ev4_HeatMap'] + n.ev3_t + '\t' + n.ev4_t + ';'
# 			if plot != "fittingLine_HeatMap":
# 				response_data['fittingLine_HeatMap'] = response_data['fittingLine_HeatMap'] + str(n.inoutdegree) + '\t' + n.fl_prob + ';'
# 			if plot != "or_HeatMap":
# 				response_data['or_HeatMap'] = response_data['or_HeatMap'] + str(n.inoutdegree) + '\t' + n.or_prob + ';'
# 			
			if plot != "degreeUW_HeatMap":
				degreeUW = n.inoutdegree_u_t + '\t' + n.inoutdegree_w_t
				if degreeUW not in degreeUWSet:
					degreeUWSet.add(degreeUW)
			if plot != "pagerankUW_HeatMap":
				pagerankUW = n.pagerank_u_t + '\t' + n.pagerank_w_t
				if pagerankUW not in pagerankUWSet:
					pagerankUWSet.add(pagerankUW)
			if plot != "ccCount_HeatMap":
				print (n.cc_dist)
				
				trou = n.cc_dist + '\t' + str(ccCount.objects.get(ccIndex=str(n.cc_dist)).count)
				if trou not in ccCountSet:
					ccCountSet.add(trou)
			
			
		for degreeCount in degreeCountSet:
			response_data['degreeCount_HeatMap'] = response_data['degreeCount_HeatMap'] + degreeCount + ';'
		for degreePagerank in degreePagerankSet:
			response_data['degreePagerank_HeatMap'] = response_data['degreePagerank_HeatMap'] + degreePagerank + ';'
		for pagerankCount in pagerankCountSet:
			response_data['pageRankCount_HeatMap'] = response_data['pageRankCount_HeatMap'] + pagerankCount + ';'
			
		for degreeUW in degreeUWSet:
			response_data['degreeUW_HeatMap'] = response_data['degreeUW_HeatMap'] + degreeUW + ';'
		for pagerankUW in pagerankUWSet:
			response_data['pagerankUW_HeatMap'] = response_data['pagerankUW_HeatMap'] + pagerankUW + ';'
		for trou in ccCountSet:
			response_data['ccCount_HeatMap'] = response_data['ccCount_HeatMap'] + trou + ';'
		

	return HttpResponse(json.dumps(response_data), content_type="application/json")

	