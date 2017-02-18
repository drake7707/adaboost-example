/// <reference path="typings/index.d.ts" />

// required for browsers that do not support the Promise object natively

let totalSize: number = 20;
let nrOfIterations = 100;
let nrOfWeakClassifiers = 1000;
let canvasWidth = 100;
let padding = 1;


interface IAdaBoostVisualization {
    main();
    abort();
}

abstract class AdaBoostVisualization<T> implements IAdaBoostVisualization {

    protected adaboost: AdaBoost.AdaBoost<T> = new AdaBoost.AdaBoost<T>();
    private isAborted: boolean = false;
    private errorRatePerIteration: number[] = [];

    abstract buildTrainingSet(): void;

    abstract isPositive(t: T): boolean;

    abstract createMaskForClassifier(evalfunc: AdaBoost.WeakClassifyFunc<T>, container: JQuery);

    abstract createMaskForWeights(samples: T[], weights: number[], container: JQuery);

    abstract createWeakClassifiers();


    async main() {
        this.buildTrainingSet();

        this.createWeakClassifiers();

        this.adaboost.prepare();
        //this.adaboost.train(100);

        $("#debug").empty();
        $("#content").empty();

        for (let i: number = 0; i < nrOfIterations && this.adaboost.minError <= 0.5; i++) {
            this.adaboost.doTrainingIteration();
            $("#debug").append("<span>Iteration " + this.adaboost.iteration + ", min error: " + this.adaboost.minError + ", best classifier: " + this.adaboost.bestClassifier + "</span>");

            this.createMaskForClassifier(this.adaboost.getWeakClassifiers()[this.adaboost.bestClassifier], $("#debug"));
            this.createMaskForClassifier((i) => this.adaboost.evaluate(i), $("#debug"));
            this.createMaskForWeights(this.adaboost.getSamples(), this.adaboost.getWeights(), $("#debug"));
            //console.error(this.adaboost.getWeights().map(s => s.toFixed(2)));



            this.updateErrorRate();
            this.updateContentOutput();

            await delay(25);

            if (this.isAborted)
                return;
        }


        let alphas = this.adaboost.getAlphas();
        let weakClassifiers = this.adaboost.getWeakClassifiers();
        for (let i: number = 0; i < weakClassifiers.length; i++) {
            let c = weakClassifiers[i];
            if (alphas[i] > 0) {
                $("#content").append("<span>Classifier " + i + ", alpha: " + alphas[i] + " </span>");
                this.createMaskForClassifier(c, $("#content"));
                $("#content").append("<br/>");
            }
        }
    }

    updateErrorRate() {
        let samplesCorrect = 0;
        let samples = this.adaboost.getSamples();
        let labels = this.adaboost.getLabels();
        for (let i: number = 0; i < samples.length; i++) {
            let result = this.adaboost.evaluate(samples[i]);
            if (result == labels[i])
                samplesCorrect++;
        }
        this.errorRatePerIteration.push(1 - samplesCorrect / samples.length);
    }

    createErrorCanvas(errorRatePerIteration: number[], container: JQuery) {
        let canvas = <HTMLCanvasElement>document.createElement("canvas");

        canvas.width = 200;
        canvas.height = 20;
        let ctx = canvas.getContext("2d");

        let max = Math.max(...errorRatePerIteration);

        ctx.fillStyle = "#bf4040";

        let cellWidth = canvas.width / nrOfIterations;
        for (let i: number = 0; i < errorRatePerIteration.length; i++) {
            let x = cellWidth * i;
            let y = canvas.height - (errorRatePerIteration[i] / max) * canvas.height;
            if (y == canvas.height)
                y = canvas.height - 1;
            ctx.fillRect(x, y, Math.floor(Math.max(1, cellWidth)), canvas.height - y);
        }

        container.append(canvas);
    }

    updateContentOutput() {
        $("#content").empty();
        $("#content").append("<span>Desired result</span>");
        this.createMaskForClassifier((i) => this.isPositive(i) ? 1 : -1, $("#content"));
        $("#content").append("<hr/>");

        $("#content").append("<span>Boosted classifier @ iteration " + this.adaboost.iteration + " & sample weights </span>");
        this.createMaskForClassifier((i) => this.adaboost.evaluate(i), $("#content"));
        this.createMaskForWeights(this.adaboost.getSamples(), this.adaboost.getWeights(), $("#content"));

        $("#content").append("<hr/>");
        $("#content").append("<span>Error: " + this.errorRatePerIteration[this.errorRatePerIteration.length - 1].toFixed(4) + "</span>");
        this.createErrorCanvas(this.errorRatePerIteration, $("#content"));

    }

    abort() {
        this.isAborted = true;
    }
}

function delay(ms: number) {
    return new Promise(then => window.setTimeout(then, ms));
}

class AdaBoost1D extends AdaBoostVisualization<number> {

    buildTrainingSet() {

        for (let i: number = 0; i < totalSize; i++) {
            this.adaboost.addSample(i, this.isPositive(i) ? 1 : -1);
        }
    }

    isPositive(i: number): boolean {
        return (i > 0.60 * totalSize && i < 0.80 * totalSize) ||
            i > 0.20 * totalSize && i < 0.40 * totalSize;
    }

    createWeakClassifiers() {
        for (let i: number = 0; i < nrOfWeakClassifiers; i++) {
            let val = Math.random();
            let val2 = Math.random();
            let flip = Math.random() < 0.5 ? false : true;
            //this.adaboost.addWeakClassifier(i => i < val * totalSize && i > val2 * totalSize ? 1 : -1);
            this.adaboost.addWeakClassifier(i => (flip ? i < val * totalSize : i > val * totalSize) ? 1 : -1);
        }

        //    this.adaboost.addWeakClassifier(i => i > 0.70 * totalSize && i < 0.9 * totalSize ? 1 : -1);
        //    this.adaboost.addWeakClassifier(i => i > 0.55 * totalSize && i < 0.75 * totalSize ? 1 : -1);
        //    this.adaboost.addWeakClassifier(i => i == 0.55 * totalSize || i == 0.75 * totalSize ? 1 : -1);

    }


    createMaskForClassifier(evalfunc: AdaBoost.WeakClassifyFunc<number>, container: JQuery) {
        let canvas = <HTMLCanvasElement>document.createElement("canvas");


        canvas.width = canvasWidth;
        canvas.height = 10;
        let ctx = canvas.getContext("2d");

        for (let i: number = 0; i < canvasWidth; i += canvasWidth / totalSize) {
            ctx.fillStyle = evalfunc(i / canvasWidth * totalSize) == 1 ? "#55bf40" : "#bf4040";
            ctx.fillRect(i, 0, Math.floor(Math.max(1, canvasWidth / totalSize - padding)), canvas.height);
        }
        canvas.setAttribute("class", "canvasBelowEachOther");
        container.append(canvas);
    }

    createMaskForWeights(samples: number[], weights: number[], container: JQuery) {
        let canvas = <HTMLCanvasElement>document.createElement("canvas");

        canvas.width = canvasWidth;
        canvas.height = 10;
        let ctx = canvas.getContext("2d");

        let max = Math.max(...weights);

        for (let i: number = 0; i < weights.length; i++) {
            let alpha = Math.floor(weights[i] / max * 255);

            ctx.fillStyle = `rgb(${0}, ${alpha}, ${alpha})`;
            let x = canvasWidth / totalSize * samples[i];
            ctx.fillRect(x, 0, Math.max(1, canvasWidth / totalSize - padding), canvas.height);
        }

        container.append(canvas);
    }
}

class Point2D {
    constructor(public x: number, public y: number) { }
}

abstract class AdaBoost2D extends AdaBoostVisualization<Point2D> {

    buildTrainingSet() {

        for (let j: number = 0; j < totalSize; j++) {
            for (let i: number = 0; i < totalSize; i++) {
                let p = new Point2D(i, j);
                this.adaboost.addSample(p, this.isPositive(p) ? 1 : -1);
            }
        }
    }

    createWeakClassifiers() {
        for (let i: number = 0; i < nrOfWeakClassifiers; i++) {
            let otherPoint = new Point2D(Math.random() * totalSize, Math.random() * totalSize);
            let pivotPoint = new Point2D(Math.random() * totalSize, Math.random() * totalSize);
            // pivotPoint -> otherPoint creates a vector
            let vSeparator = new Point2D(otherPoint.x - pivotPoint.x, otherPoint.y - pivotPoint.y);

            this.adaboost.addWeakClassifier(p => {
                let vToP = new Point2D(p.x - pivotPoint.x, p.y - pivotPoint.y);
                // now take the dot product between the vectors. if it's positive it's on 1 side, otherwise on the other
                return vToP.x * vSeparator.x + vToP.y * vSeparator.y > 0 ? -1 : 1;
            });
        }
    }

    protected createAxisAlignedWeakClassifiers() {
        for (let i: number = 0; i < nrOfWeakClassifiers; i++) {
            let val = Math.random();
            let flip = Math.random() < 0.5 ? false : true;
            let dimX = Math.random() < 0.5 ? true : false;
            //this.adaboost.addWeakClassifier(i => i < val * totalSize && i > val2 * totalSize ? 1 : -1);
            this.adaboost.addWeakClassifier(p => {
                if (dimX)
                    return (flip ? p.x < val * totalSize : p.x > val * totalSize) ? 1 : -1;
                else
                    return (flip ? p.y < val * totalSize : p.y > val * totalSize) ? 1 : -1;
            });
        }
    }

    createMaskForClassifier(evalfunc: AdaBoost.WeakClassifyFunc<Point2D>, container: JQuery) {
        let canvas = <HTMLCanvasElement>document.createElement("canvas");

        canvas.width = canvasWidth;
        canvas.height = canvasWidth;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "#CCC";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let j: number = 0; j < canvasWidth; j += canvasWidth / totalSize) {
            for (let i: number = 0; i < canvasWidth; i += canvasWidth / totalSize) {
                let p = new Point2D(i / canvasWidth * totalSize, j / canvasWidth * totalSize);
                ctx.fillStyle = evalfunc(p) == 1 ? "#55bf40" : "#bf4040";
                ctx.fillRect(i, j, Math.floor(Math.max(1, canvasWidth / totalSize - padding)), Math.floor(Math.max(1, canvasWidth / totalSize - padding)));
            }
        }
        container.append(canvas);
    }

    createMaskForWeights(samples: Point2D[], weights: number[], container: JQuery) {
        let canvas = <HTMLCanvasElement>document.createElement("canvas");

        canvas.width = canvasWidth;
        canvas.height = canvasWidth;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "#CCC";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let max = Math.max(...weights);

        for (let i: number = 0; i < weights.length; i++) {
            let alpha = Math.floor(weights[i] / max * 255);

            ctx.fillStyle = `rgb(${0}, ${alpha}, ${alpha})`;
            let x = canvasWidth / totalSize * samples[i].x;
            let y = canvasWidth / totalSize * samples[i].y;
            ctx.fillRect(x, y, Math.floor(Math.max(1, canvasWidth / totalSize - padding)), Math.floor(Math.max(1, canvasWidth / totalSize - padding)));
        }

        container.append(canvas);
    }
}


class AdaBoost2DPlusSign extends AdaBoost2D {

    constructor(private useAxisAlignedClassifiers: boolean) {
        super();
    }

    isPositive(p: Point2D): boolean {
        return (p.x > 0.40 * totalSize && p.x < 0.60 * totalSize) ||
            p.y > 0.40 * totalSize && p.y < 0.60 * totalSize;
    }

    createWeakClassifiers() {
        if (!this.useAxisAlignedClassifiers)
            super.createWeakClassifiers();
        else {
            super.createAxisAlignedWeakClassifiers();
        }

    }
}


class AdaBoost2DCircle extends AdaBoost2D {
    isPositive(p: Point2D): boolean {
        return Math.sqrt((p.x - 0.5 * totalSize) ** 2 + (p.y - 0.5 * totalSize) ** 2) < 0.25 * totalSize;
    }
}

class AdaBoost2DRandomSplit extends AdaBoost2D {


    constructor(private useAxisAlignedClassifiers: boolean) {
        super();
    }

    private otherPoint = new Point2D(Math.random() * totalSize, Math.random() * totalSize);
    isPositive(p: Point2D): boolean {
        //return (p.x > 0.40 * totalSize && p.x < 0.60 * totalSize) ||
        //p.y > 0.40 * totalSize && p.y < 0.60 * totalSize;
        //return Math.sqrt((p.x - 0.5 * totalSize) ** 2 + (p.y - 0.5 * totalSize) ** 2) < 0.25 * totalSize;

        let pivotPoint = new Point2D(0.5 * totalSize, 0.5 * totalSize);

        // pivotPoint -> otherPoint creates a vector
        let vSeparator = new Point2D(this.otherPoint.x - pivotPoint.x, this.otherPoint.y - pivotPoint.y);
        let vToP = new Point2D(p.x - pivotPoint.x, p.y - pivotPoint.y);

        // now take the dot product between the vectors. if it's positive it's on 1 side, otherwise on the other
        return vToP.x * vSeparator.x + vToP.y * vSeparator.y > 0;

    }

    createWeakClassifiers() {
        if (!this.useAxisAlignedClassifiers)
            super.createWeakClassifiers();
        else {
            super.createAxisAlignedWeakClassifiers();
        }

    }
}

namespace AdaBoost {

    export interface WeakClassifyFunc<T> {
        (sample: T): number;
    }


    class Classifier<T> {
        constructor(public weakClassifyFunc: WeakClassifyFunc<T>, public alpha: number, public evaluationResult: number[]) { }
    }

    class Sample<T> {
        constructor(public sample: T, public label: number, public weight: number) { }
    }

    class TrainingSet<T> {
        constructor(public samples: Sample<T>[]) { }
    }

    export class AdaBoost<T> {

        private classifiers: Classifier<T>[] = [];
        private trainingSet: TrainingSet<T> = new TrainingSet<T>([]);

        minError: number = 0;
        bestClassifier: number = -1;
        iteration: number = 0;
        isPrepared: boolean = false;

        addWeakClassifier(classifier: WeakClassifyFunc<T>) {
            this.classifiers.push(new Classifier<T>(classifier, 0, []));

            // rebuild the evaluation cache and initial weights
            if (this.isPrepared)
                this.prepare();
        }

        addSample(sample: T, label: number) {
            this.trainingSet.samples.push(new Sample<T>(sample, label, 0));

            // rebuild the evaluation cache and initial weights
            if (this.isPrepared)
                this.prepare();
        }

        getWeakClassifiers(): WeakClassifyFunc<T>[] {
            return this.classifiers.map(c => c.weakClassifyFunc);
        }

        getWeights(): number[] {
            return this.trainingSet.samples.map(s => s.weight);
        }

        getSamples(): T[] {
            return this.trainingSet.samples.map(s => s.sample);
        }
        getLabels(): number[] {
            return this.trainingSet.samples.map(s => s.label);
        }
        getAlphas() {
            return this.classifiers.map(c => c.alpha);
        }

        prepare() {

            // evaluate the entire training set for all potential classifiers
            for (let c of this.classifiers) {
                for (let s of this.trainingSet.samples)
                    c.evaluationResult.push(c.weakClassifyFunc(s.sample));
            }

            // set all sample weights evenly
            let initialWeightValue: number = 1.0 / this.trainingSet.samples.length;
            for (let i: number = 0; i < this.trainingSet.samples.length; i++)
                this.trainingSet.samples[i].weight = initialWeightValue;
            this.isPrepared = true;
        }

        train(iterations: number) {
            if (!this.isPrepared)
                this.prepare();

            while (this.iteration < iterations && this.minError < 0.5) {
                this.doTrainingIteration();
            }
        }

        evaluate(sample: T): number {
            let result = 0;
            for (let c of this.classifiers) {
                result += c.alpha * c.weakClassifyFunc(sample);
            }
            return result > 0 ? 1 : -1;
        }

        doTrainingIteration() {
            let minError = Number.MAX_VALUE;
            let bestClassifier: Classifier<T> = null;

            for (let i: number = 0; i < this.classifiers.length; i++) {
                let c = this.classifiers[i];
                let error = this.getClassifierError(c);
                if (error < minError) {
                    minError = error;
                    bestClassifier = c;
                    this.bestClassifier = i;
                }
            }

            this.minError = minError;

            if (minError >= 0.5)
                return;

            let newAlpha = 1 / 2 * Math.log((1 - minError) / minError);
            bestClassifier.alpha = newAlpha;

            // update sample weights according to error
            let newSumWeights: number = 0;
            let newWeights: number[] = [];
            for (let i: number = 0; i < this.trainingSet.samples.length; i++) {
                // give more importance to the misclassified samples ( y * h == -1)
                // and less importance to the correctly classified samples
                let y = this.trainingSet.samples[i].label;
                let h = bestClassifier.evaluationResult[i];
                let newWeight = this.trainingSet.samples[i].weight * Math.exp(-newAlpha * y * h);

                newWeights.push(newWeight);
                newSumWeights += newWeight;
            }

            for (let i: number = 0; i < this.trainingSet.samples.length; i++) {
                this.trainingSet.samples[i].weight = newWeights[i] / newSumWeights;
            }

            this.iteration++;
        }

        private getClassifierError(classifier: Classifier<T>): number {
            let sumMisclassifiedWeights = 0;
            for (let i: number = 0; i < this.trainingSet.samples.length; i++) {
                if (classifier.evaluationResult[i] != this.trainingSet.samples[i].label)
                    sumMisclassifiedWeights += this.trainingSet.samples[i].weight;
            }
            return sumMisclassifiedWeights;
        }
    }
}

    
let currentTest: IAdaBoostVisualization = null;
$("#btnGo").click(function() {
    if (currentTest != null) {
        currentTest.abort();
        currentTest = null;
    }

    if ($("#chk1D").prop("checked"))
        currentTest = new AdaBoost1D();
    else if ($("#chk2DPlus").prop("checked"))
        currentTest = new AdaBoost2DPlusSign(false);
    else if ($("#chk2DPlusAxisAlignedClassifiers").prop("checked"))
        currentTest = new AdaBoost2DPlusSign(true);

    else if ($("#chk2DRandomSplit").prop("checked"))
        currentTest = new AdaBoost2DRandomSplit(false);
    else if ($("#chk2DRandomSplitAxisAlignedClassifiers").prop("checked"))
        currentTest = new AdaBoost2DRandomSplit(true);
    else if ($("#chk2DCircle").prop("checked"))
        currentTest = new AdaBoost2DCircle();

    if (currentTest != null)
        currentTest.main();
});
