import sys

if len(sys.argv) != 3:
    sys.exit('usage: addNumber.py inputFilePath outputFilePath')

inputFilePath = sys.argv[1]
outputFilePath = sys.argv[2]

fIn = open(inputFilePath, 'r')
fOut = open(outputFilePath, 'w')

lines = fIn.readlines()

counter = 0
for line in lines:
    
    fOut.write(str(counter) + '\t' + line)

    counter = counter + 1

fIn.close()
fOut.close()