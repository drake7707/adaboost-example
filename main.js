/// <reference path="https://cdn.rawgit.com/borisyankov/DefinitelyTyped/master/jquery/index.d.ts" />
// required for browsers that do not support the Promise object natively
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var totalSize = 20;
var nrOfIterations = 100;
var nrOfWeakClassifiers = 1000;
var canvasWidth = 100;
var padding = 1;
var AdaBoostVisualization = (function () {
    function AdaBoostVisualization() {
        this.adaboost = new AdaBoost.AdaBoost();
        this.isAborted = false;
        this.errorRatePerIteration = [];
    }
    AdaBoostVisualization.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var i, alphas, weakClassifiers, i, c;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.buildTrainingSet();
                        this.createWeakClassifiers();
                        this.adaboost.prepare();
                        //this.adaboost.train(100);
                        $("#debug").empty();
                        $("#content").empty();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < nrOfIterations && this.adaboost.minError <= 0.5))
                            return [3 /*break*/, 4];
                        this.adaboost.doTrainingIteration();
                        $("#debug").append("<span>Iteration " + this.adaboost.iteration + ", min error: " + this.adaboost.minError + ", best classifier: " + this.adaboost.bestClassifier + "</span>");
                        this.createMaskForClassifier(this.adaboost.getWeakClassifiers()[this.adaboost.bestClassifier], $("#debug"));
                        this.createMaskForClassifier(function (i) { return _this.adaboost.evaluate(i); }, $("#debug"));
                        this.createMaskForWeights(this.adaboost.getSamples(), this.adaboost.getWeights(), $("#debug"));
                        //console.error(this.adaboost.getWeights().map(s => s.toFixed(2)));
                        this.updateErrorRate();
                        this.updateContentOutput();
                        return [4 /*yield*/, delay(25)];
                    case 2:
                        _a.sent();
                        if (this.isAborted)
                            return [2 /*return*/];
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        alphas = this.adaboost.getAlphas();
                        weakClassifiers = this.adaboost.getWeakClassifiers();
                        for (i = 0; i < weakClassifiers.length; i++) {
                            c = weakClassifiers[i];
                            if (alphas[i] > 0) {
                                $("#content").append("<span>Classifier " + i + ", alpha: " + alphas[i] + " </span>");
                                this.createMaskForClassifier(c, $("#content"));
                                $("#content").append("<br/>");
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AdaBoostVisualization.prototype.updateErrorRate = function () {
        var samplesCorrect = 0;
        var samples = this.adaboost.getSamples();
        var labels = this.adaboost.getLabels();
        for (var i = 0; i < samples.length; i++) {
            var result = this.adaboost.evaluate(samples[i]);
            if (result == labels[i])
                samplesCorrect++;
        }
        this.errorRatePerIteration.push(1 - samplesCorrect / samples.length);
    };
    AdaBoostVisualization.prototype.createErrorCanvas = function (errorRatePerIteration, container) {
        var canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 20;
        var ctx = canvas.getContext("2d");
        var max = Math.max.apply(Math, errorRatePerIteration);
        ctx.fillStyle = "#bf4040";
        var cellWidth = canvas.width / nrOfIterations;
        for (var i = 0; i < errorRatePerIteration.length; i++) {
            var x = cellWidth * i;
            var y = canvas.height - (errorRatePerIteration[i] / max) * canvas.height;
            if (y == canvas.height)
                y = canvas.height - 1;
            ctx.fillRect(x, y, Math.floor(Math.max(1, cellWidth)), canvas.height - y);
        }
        container.append(canvas);
    };
    AdaBoostVisualization.prototype.updateContentOutput = function () {
        var _this = this;
        $("#content").empty();
        $("#content").append("<span>Desired result</span>");
        this.createMaskForClassifier(function (i) { return _this.isPositive(i) ? 1 : -1; }, $("#content"));
        $("#content").append("<hr/>");
        $("#content").append("<span>Boosted classifier @ iteration " + this.adaboost.iteration + " & sample weights </span>");
        this.createMaskForClassifier(function (i) { return _this.adaboost.evaluate(i); }, $("#content"));
        this.createMaskForWeights(this.adaboost.getSamples(), this.adaboost.getWeights(), $("#content"));
        $("#content").append("<hr/>");
        $("#content").append("<span>Error: " + this.errorRatePerIteration[this.errorRatePerIteration.length - 1].toFixed(4) + "</span>");
        this.createErrorCanvas(this.errorRatePerIteration, $("#content"));
    };
    AdaBoostVisualization.prototype.abort = function () {
        this.isAborted = true;
    };
    return AdaBoostVisualization;
}());
function delay(ms) {
    return new Promise(function (then) { return window.setTimeout(then, ms); });
}
var AdaBoost1D = (function (_super) {
    __extends(AdaBoost1D, _super);
    function AdaBoost1D() {
        return _super.apply(this, arguments) || this;
    }
    AdaBoost1D.prototype.buildTrainingSet = function () {
        for (var i = 0; i < totalSize; i++) {
            this.adaboost.addSample(i, this.isPositive(i) ? 1 : -1);
        }
    };
    AdaBoost1D.prototype.isPositive = function (i) {
        return (i > 0.60 * totalSize && i < 0.80 * totalSize) ||
            i > 0.20 * totalSize && i < 0.40 * totalSize;
    };
    AdaBoost1D.prototype.createWeakClassifiers = function () {
        var _loop_1 = function (i) {
            var val = Math.random();
            var val2 = Math.random();
            var flip = Math.random() < 0.5 ? false : true;
            //this.adaboost.addWeakClassifier(i => i < val * totalSize && i > val2 * totalSize ? 1 : -1);
            this_1.adaboost.addWeakClassifier(function (i) { return (flip ? i < val * totalSize : i > val * totalSize) ? 1 : -1; });
        };
        var this_1 = this;
        for (var i = 0; i < nrOfWeakClassifiers; i++) {
            _loop_1(i);
        }
        //    this.adaboost.addWeakClassifier(i => i > 0.70 * totalSize && i < 0.9 * totalSize ? 1 : -1);
        //    this.adaboost.addWeakClassifier(i => i > 0.55 * totalSize && i < 0.75 * totalSize ? 1 : -1);
        //    this.adaboost.addWeakClassifier(i => i == 0.55 * totalSize || i == 0.75 * totalSize ? 1 : -1);
    };
    AdaBoost1D.prototype.createMaskForClassifier = function (evalfunc, container) {
        var canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = 10;
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < canvasWidth; i += canvasWidth / totalSize) {
            ctx.fillStyle = evalfunc(i / canvasWidth * totalSize) == 1 ? "#55bf40" : "#bf4040";
            ctx.fillRect(i, 0, Math.floor(Math.max(1, canvasWidth / totalSize - padding)), canvas.height);
        }
        canvas.setAttribute("class", "canvasBelowEachOther");
        container.append(canvas);
    };
    AdaBoost1D.prototype.createMaskForWeights = function (samples, weights, container) {
        var canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = 10;
        var ctx = canvas.getContext("2d");
        var max = Math.max.apply(Math, weights);
        for (var i = 0; i < weights.length; i++) {
            var alpha = Math.floor(weights[i] / max * 255);
            ctx.fillStyle = "rgb(" + 0 + ", " + alpha + ", " + alpha + ")";
            var x = canvasWidth / totalSize * samples[i];
            ctx.fillRect(x, 0, Math.max(1, canvasWidth / totalSize - padding), canvas.height);
        }
        container.append(canvas);
    };
    return AdaBoost1D;
}(AdaBoostVisualization));
var Point2D = (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point2D;
}());
var AdaBoost2D = (function (_super) {
    __extends(AdaBoost2D, _super);
    function AdaBoost2D() {
        return _super.apply(this, arguments) || this;
    }
    AdaBoost2D.prototype.buildTrainingSet = function () {
        for (var j = 0; j < totalSize; j++) {
            for (var i = 0; i < totalSize; i++) {
                var p = new Point2D(i, j);
                this.adaboost.addSample(p, this.isPositive(p) ? 1 : -1);
            }
        }
    };
    AdaBoost2D.prototype.createWeakClassifiers = function () {
        var _loop_2 = function (i) {
            var otherPoint = new Point2D(Math.random() * totalSize, Math.random() * totalSize);
            var pivotPoint = new Point2D(Math.random() * totalSize, Math.random() * totalSize);
            // pivotPoint -> otherPoint creates a vector
            var vSeparator = new Point2D(otherPoint.x - pivotPoint.x, otherPoint.y - pivotPoint.y);
            this_2.adaboost.addWeakClassifier(function (p) {
                var vToP = new Point2D(p.x - pivotPoint.x, p.y - pivotPoint.y);
                // now take the dot product between the vectors. if it's positive it's on 1 side, otherwise on the other
                return vToP.x * vSeparator.x + vToP.y * vSeparator.y > 0 ? -1 : 1;
            });
        };
        var this_2 = this;
        for (var i = 0; i < nrOfWeakClassifiers; i++) {
            _loop_2(i);
        }
    };
    AdaBoost2D.prototype.createAxisAlignedWeakClassifiers = function () {
        var _loop_3 = function (i) {
            var val = Math.random();
            var flip = Math.random() < 0.5 ? false : true;
            var dimX = Math.random() < 0.5 ? true : false;
            //this.adaboost.addWeakClassifier(i => i < val * totalSize && i > val2 * totalSize ? 1 : -1);
            this_3.adaboost.addWeakClassifier(function (p) {
                if (dimX)
                    return (flip ? p.x < val * totalSize : p.x > val * totalSize) ? 1 : -1;
                else
                    return (flip ? p.y < val * totalSize : p.y > val * totalSize) ? 1 : -1;
            });
        };
        var this_3 = this;
        for (var i = 0; i < nrOfWeakClassifiers; i++) {
            _loop_3(i);
        }
    };
    AdaBoost2D.prototype.createMaskForClassifier = function (evalfunc, container) {
        var canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasWidth;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#CCC";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var j = 0; j < canvasWidth; j += canvasWidth / totalSize) {
            for (var i = 0; i < canvasWidth; i += canvasWidth / totalSize) {
                var p = new Point2D(i / canvasWidth * totalSize, j / canvasWidth * totalSize);
                ctx.fillStyle = evalfunc(p) == 1 ? "#55bf40" : "#bf4040";
                ctx.fillRect(i, j, Math.floor(Math.max(1, canvasWidth / totalSize - padding)), Math.floor(Math.max(1, canvasWidth / totalSize - padding)));
            }
        }
        container.append(canvas);
    };
    AdaBoost2D.prototype.createMaskForWeights = function (samples, weights, container) {
        var canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasWidth;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#CCC";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var max = Math.max.apply(Math, weights);
        for (var i = 0; i < weights.length; i++) {
            var alpha = Math.floor(weights[i] / max * 255);
            ctx.fillStyle = "rgb(" + 0 + ", " + alpha + ", " + alpha + ")";
            var x = canvasWidth / totalSize * samples[i].x;
            var y = canvasWidth / totalSize * samples[i].y;
            ctx.fillRect(x, y, Math.floor(Math.max(1, canvasWidth / totalSize - padding)), Math.floor(Math.max(1, canvasWidth / totalSize - padding)));
        }
        container.append(canvas);
    };
    return AdaBoost2D;
}(AdaBoostVisualization));
var AdaBoost2DPlusSign = (function (_super) {
    __extends(AdaBoost2DPlusSign, _super);
    function AdaBoost2DPlusSign(useAxisAlignedClassifiers) {
        var _this = _super.call(this) || this;
        _this.useAxisAlignedClassifiers = useAxisAlignedClassifiers;
        return _this;
    }
    AdaBoost2DPlusSign.prototype.isPositive = function (p) {
        return (p.x > 0.40 * totalSize && p.x < 0.60 * totalSize) ||
            p.y > 0.40 * totalSize && p.y < 0.60 * totalSize;
    };
    AdaBoost2DPlusSign.prototype.createWeakClassifiers = function () {
        if (!this.useAxisAlignedClassifiers)
            _super.prototype.createWeakClassifiers.call(this);
        else {
            _super.prototype.createAxisAlignedWeakClassifiers.call(this);
        }
    };
    return AdaBoost2DPlusSign;
}(AdaBoost2D));
var AdaBoost2DCircle = (function (_super) {
    __extends(AdaBoost2DCircle, _super);
    function AdaBoost2DCircle() {
        return _super.apply(this, arguments) || this;
    }
    AdaBoost2DCircle.prototype.isPositive = function (p) {
        return Math.sqrt(Math.pow((p.x - 0.5 * totalSize), 2) + Math.pow((p.y - 0.5 * totalSize), 2)) < 0.25 * totalSize;
    };
    return AdaBoost2DCircle;
}(AdaBoost2D));
var AdaBoost2DRandomSplit = (function (_super) {
    __extends(AdaBoost2DRandomSplit, _super);
    function AdaBoost2DRandomSplit(useAxisAlignedClassifiers) {
        var _this = _super.call(this) || this;
        _this.useAxisAlignedClassifiers = useAxisAlignedClassifiers;
        _this.otherPoint = new Point2D(Math.random() * totalSize, Math.random() * totalSize);
        return _this;
    }
    AdaBoost2DRandomSplit.prototype.isPositive = function (p) {
        //return (p.x > 0.40 * totalSize && p.x < 0.60 * totalSize) ||
        //p.y > 0.40 * totalSize && p.y < 0.60 * totalSize;
        //return Math.sqrt((p.x - 0.5 * totalSize) ** 2 + (p.y - 0.5 * totalSize) ** 2) < 0.25 * totalSize;
        var pivotPoint = new Point2D(0.5 * totalSize, 0.5 * totalSize);
        // pivotPoint -> otherPoint creates a vector
        var vSeparator = new Point2D(this.otherPoint.x - pivotPoint.x, this.otherPoint.y - pivotPoint.y);
        var vToP = new Point2D(p.x - pivotPoint.x, p.y - pivotPoint.y);
        // now take the dot product between the vectors. if it's positive it's on 1 side, otherwise on the other
        return vToP.x * vSeparator.x + vToP.y * vSeparator.y > 0;
    };
    AdaBoost2DRandomSplit.prototype.createWeakClassifiers = function () {
        if (!this.useAxisAlignedClassifiers)
            _super.prototype.createWeakClassifiers.call(this);
        else {
            _super.prototype.createAxisAlignedWeakClassifiers.call(this);
        }
    };
    return AdaBoost2DRandomSplit;
}(AdaBoost2D));
var AdaBoost;
(function (AdaBoost_1) {
    var Classifier = (function () {
        function Classifier(weakClassifyFunc, alpha, evaluationResult) {
            this.weakClassifyFunc = weakClassifyFunc;
            this.alpha = alpha;
            this.evaluationResult = evaluationResult;
        }
        return Classifier;
    }());
    var Sample = (function () {
        function Sample(sample, label, weight) {
            this.sample = sample;
            this.label = label;
            this.weight = weight;
        }
        return Sample;
    }());
    var TrainingSet = (function () {
        function TrainingSet(samples) {
            this.samples = samples;
        }
        return TrainingSet;
    }());
    var AdaBoost = (function () {
        function AdaBoost() {
            this.classifiers = [];
            this.trainingSet = new TrainingSet([]);
            this.minError = 0;
            this.bestClassifier = -1;
            this.iteration = 0;
            this.isPrepared = false;
        }
        AdaBoost.prototype.addWeakClassifier = function (classifier) {
            this.classifiers.push(new Classifier(classifier, 0, []));
            // rebuild the evaluation cache and initial weights
            if (this.isPrepared)
                this.prepare();
        };
        AdaBoost.prototype.addSample = function (sample, label) {
            this.trainingSet.samples.push(new Sample(sample, label, 0));
            // rebuild the evaluation cache and initial weights
            if (this.isPrepared)
                this.prepare();
        };
        AdaBoost.prototype.getWeakClassifiers = function () {
            return this.classifiers.map(function (c) { return c.weakClassifyFunc; });
        };
        AdaBoost.prototype.getWeights = function () {
            return this.trainingSet.samples.map(function (s) { return s.weight; });
        };
        AdaBoost.prototype.getSamples = function () {
            return this.trainingSet.samples.map(function (s) { return s.sample; });
        };
        AdaBoost.prototype.getLabels = function () {
            return this.trainingSet.samples.map(function (s) { return s.label; });
        };
        AdaBoost.prototype.getAlphas = function () {
            return this.classifiers.map(function (c) { return c.alpha; });
        };
        AdaBoost.prototype.prepare = function () {
            // evaluate the entire training set for all potential classifiers
            for (var _i = 0, _a = this.classifiers; _i < _a.length; _i++) {
                var c = _a[_i];
                for (var _b = 0, _c = this.trainingSet.samples; _b < _c.length; _b++) {
                    var s = _c[_b];
                    c.evaluationResult.push(c.weakClassifyFunc(s.sample));
                }
            }
            // set all sample weights evenly
            var initialWeightValue = 1.0 / this.trainingSet.samples.length;
            for (var i = 0; i < this.trainingSet.samples.length; i++)
                this.trainingSet.samples[i].weight = initialWeightValue;
            this.isPrepared = true;
        };
        AdaBoost.prototype.train = function (iterations) {
            if (!this.isPrepared)
                this.prepare();
            while (this.iteration < iterations && this.minError < 0.5) {
                this.doTrainingIteration();
            }
        };
        AdaBoost.prototype.evaluate = function (sample) {
            var result = 0;
            for (var _i = 0, _a = this.classifiers; _i < _a.length; _i++) {
                var c = _a[_i];
                result += c.alpha * c.weakClassifyFunc(sample);
            }
            return result > 0 ? 1 : -1;
        };
        AdaBoost.prototype.doTrainingIteration = function () {
            var minError = Number.MAX_VALUE;
            var bestClassifier = null;
            for (var i = 0; i < this.classifiers.length; i++) {
                var c = this.classifiers[i];
                var error = this.getClassifierError(c);
                if (error < minError) {
                    minError = error;
                    bestClassifier = c;
                    this.bestClassifier = i;
                }
            }
            this.minError = minError;
            if (minError >= 0.5)
                return;
            var newAlpha = 1 / 2 * Math.log((1 - minError) / minError);
            bestClassifier.alpha = newAlpha;
            // update sample weights according to error
            var newSumWeights = 0;
            var newWeights = [];
            for (var i = 0; i < this.trainingSet.samples.length; i++) {
                // give more importance to the misclassified samples ( y * h == -1)
                // and less importance to the correctly classified samples
                var y = this.trainingSet.samples[i].label;
                var h = bestClassifier.evaluationResult[i];
                var newWeight = this.trainingSet.samples[i].weight * Math.exp(-newAlpha * y * h);
                newWeights.push(newWeight);
                newSumWeights += newWeight;
            }
            for (var i = 0; i < this.trainingSet.samples.length; i++) {
                this.trainingSet.samples[i].weight = newWeights[i] / newSumWeights;
            }
            this.iteration++;
        };
        AdaBoost.prototype.getClassifierError = function (classifier) {
            var sumMisclassifiedWeights = 0;
            for (var i = 0; i < this.trainingSet.samples.length; i++) {
                if (classifier.evaluationResult[i] != this.trainingSet.samples[i].label)
                    sumMisclassifiedWeights += this.trainingSet.samples[i].weight;
            }
            return sumMisclassifiedWeights;
        };
        return AdaBoost;
    }());
    AdaBoost_1.AdaBoost = AdaBoost;
})(AdaBoost || (AdaBoost = {}));
var currentTest = null;
$("#btnGo").click(function () {
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
//# sourceMappingURL=main.js.map