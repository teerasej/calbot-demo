const request = require('request').defaults({encoding: null});




exports.getImageStremFromMessage =  (stream) => {
    var apiUrl = "https://southcentralus.api.cognitive.microsoft.com/customvision/v1.1/Prediction/" +
            "6a1423fc-ce0e-4246-b070-b347e167d8c9/image";
    return new Promise(function (resolve, reject) {
        var requestData = {
            url: apiUrl,
            encoding: 'binary',
            json: true,
            headers: {
                "Prediction-key": "6731b30f969b4e51b30cd07e899d2cdb",
                'content-type': 'application/octet-stream'
            }
        };

        stream.pipe(request.post(requestData, function (error, response, body) {
            if (error) {
                reject(error);
            } else if (response.statusCode !== 200) {
                reject(body);
            } else {
                resolve(extractTag(body));
            }
        }));
    });
};

const extractTag = (body) => {
     if (body) {
        var max = body.Predictions[0];
        console.log('====================================');
        console.log(max.Probability);
        console.log('====================================');
        for (let index = 0; index < body.Predictions.length; index++) {
            if( max.Probability < body.Predictions[index].Probability ) {
                max = body.Predictions[index];
            }
        }
        return max.Tag;
    }
    return null;
}