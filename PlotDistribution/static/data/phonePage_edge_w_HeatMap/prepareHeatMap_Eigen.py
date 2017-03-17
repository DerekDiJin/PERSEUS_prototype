import sys
import math

NUM_X = 5000
NUM_Y = 5000

def distance(x_target, y_target, x_point, y_point): 
    return math.sqrt((x_target-x_point)**2 + (y_target-y_point)**2)

def selectNearest(tempSet, pointDegree, pointPageRank):
    tempMap = {}
    for element in tempSet:
        parts = element.split("\t")
        x_Coor = float(parts[0])
        y_Coor = float(parts[1])
        curDistance = distance(x_Coor, y_Coor, pointDegree, pointPageRank)
        tempMap[curDistance] = element
    
    keyList = tempMap.keys()
    keyList.sort()
    minValue = keyList[0]
    return tempMap[minValue]


if len(sys.argv) != 4:
    sys.exit("Usage: prepareHeatMap_Eigen.py inputFilePath outputFilePath correspondFilePath")

xSet = set()
ySet = set()

xyTargetMap = {}

inputFilePath = sys.argv[1]
outputFilePath = sys.argv[2]
correspondFilePath = sys.argv[3] 
fIn = open(inputFilePath)
lines = fIn.readlines()

for line in lines:
    #if i != 5:
    attrs = line.split("\t")
    xSet.add(float(attrs[0]))
    ySet.add(float(attrs[1]))
    xyMapKey = attrs[0] + "\t" + attrs[1]
    #else:
    #    break;
    #i = i + 1

xMaxValue = max(xSet)
xMinValue = min(xSet)
yMaxValue = max(ySet)
yMinValue = min(ySet)

recordX = []
recordY = []

i = 0
for i in range(0, NUM_X+2):
    xTarget = float((xMaxValue - xMinValue))/NUM_X * i + xMinValue
    if i == 0:
        xTarget = xTarget - 0.0000001
    recordX.append(xTarget)
    for j in range(0, NUM_Y+2):   
        yTarget = float((yMaxValue - yMinValue))/NUM_Y * j + yMinValue
        if j == 0:
            yTarget = yTarget - 0.0000001
        targetCoor = str(xTarget) + "\t" + str(yTarget)
        xyTargetMap[targetCoor] = 0
        recordY.append(yTarget)


#---Next step.
counter = 1
fIn = open(inputFilePath)
fCorresOut = open(correspondFilePath, 'w')

lines = fIn.readlines()
for line in lines:
    print counter
    attrs = line.split("\t")
    degree = float(attrs[0])
    pageRank = float(attrs[1])
    i = 0
    j = 0
    xTemp = 0
    yTemp = 0
    #print recordX[0]
    # xMinValue = min(xSet)
    #print ":)"
    #print degree
    #print ":("
    #print recordX[NUM_X]
    while(degree > recordX[i]):
        i = i + 1
    #print "--"
    #print recordX[i]
    if (degree - recordX[i-1]) < recordX[i] - degree:
        xTemp = recordX[i-1]
    else:
        xTemp = recordX[i]
    
    while(pageRank > recordY[j]):
        j = j + 1
    if (pageRank - recordY[j-1]) < recordY[j] - pageRank:
        yTemp = recordY[j-1]
    else:
        yTemp = recordY[j]
    minCoor = str(xTemp) + '\t' + str(yTemp)
    #print "--"
    #print recordY[j]
    # tempSet = set()
    # tempSet.add(str(recordX[i]) + "\t" + str(recordY[j]))
    # if(i - 1 >= 0):
    #     tempSet.add(str(recordX[i-1]) + "\t" + str(recordY[j]))
    # if(j - 1 >= 0):
    #     tempSet.add(str(recordX[i]) + "\t" + str(recordY[j-1]))
    # if(i - 1 >= 0 and j - 1 >= 0):
    #     tempSet.add(str(recordX[i-1]) + "\t" + str(recordY[j-1]))
    # minCoor = selectNearest(tempSet, degree, pageRank)

    
    curValue = xyTargetMap[minCoor]
    xyTargetMap[minCoor] = curValue + 1
    
    minCoor_space = minCoor.replace("\t", " ")
    
    fCorresOut.write(str(counter) + "\t" + attrs[0] + " " + attrs[1].replace("\n", "") + "\t" + minCoor_space + "\n")
    counter = counter + 1

fIn.close()
fCorresOut.close()

xyTargetMapp = {}
for element in xyTargetMap:
    if(xyTargetMap[element] != 0):
        xyTargetMapp[element] = xyTargetMap[element]
    
print len(xyTargetMapp)

fout = open(outputFilePath, 'w')
for element in xyTargetMapp:
    fout.write(element + "\t" + str(xyTargetMapp[element]) + "\n")
fout.close()
