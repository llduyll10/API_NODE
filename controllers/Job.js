var Job = require('../models/Job');
var Company = require('../models/Company');
var verified = require('../config/verified');
var Handlebars = require('handlebars');
var fs = require('fs');
var config = require('../config/database');
var getToken = require('../config/token');
var jwt = require('jwt-simple');
const htmlToText = require('html-to-text');
module.exports = function (app, io) {


    app.get('/api/search/job', function (req, res) {
        var skip = parseInt(req.query.skip || 0);
        var limit = parseInt(req.query.limit || 25);
        Job.find({ $text: { $search: req.query.s } })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'company', select: 'name logo' })
            .exec(function (err, docs) {
                res.json(docs || []);
            });
    });

    app.get('/api/search/company', function (req, res) {
        var skip = parseInt(req.query.skip || 0);
        var limit = parseInt(req.query.limit || 25);
        Company.find({ $text: { $search: req.query.s } })
            .skip(skip)
            .limit(limit)
            .exec(function (err, docs) {
                res.json(docs || []);
            });
    });

    app.get('/api/tags/', function (req, res) {
        // var data = {
        //     title: 'practical node.js',
        //     author: '@azat_co',
        //     tags: ['express', 'node', 'javascript']
        //   }
        //   var template = Handlebars.compile(source);
        //   var html = template(data);

        res.json(["Python", "Japanese", "MySQL", "Sharepoint", "HTML5", "C#", "CSS", "Agile", "Mobile Apps", "Linux", "System Engineer", "System Admin", "OOP", "Ruby on Rails", "Database", "Objective C", "UI-UX", "MVC", "Bridge Engineer", "JSON", "Software Architect", "Team Leader", "SQL", "Unity", "Django", "PostgreSql", "AngularJS", "C++", "JavaScript", "Product Manager", "NodeJS", "ERP", "Wordpress", "Drupal", "Ruby", "English", "C language", "Games", "Project Manager", "IT Support", "Networking", "JQuery", "Magento", "J2EE", "Oracle", "Embedded", "Java", "Manager", "PHP", "Tester", "Android", "iOS", "Business Analyst", "ASP.NET", "QA QC", "SAP", "ReactJS", ".NET", "Zend", "Yii", "Joomla", "CakePHP", "Symfony", "MeteorJS", "MongoDB", "Scrum", "Cocos", "Algorithm", "Puppet", "Chef", "Designer", "Selenium", "DevOps", "Laravel", "AWS", "React Native", "Swift", "Golang", "Spring", "Hybrid", "Xamarin", "Cloud", "jQuery", "Blockchain", "Angular", "NoSQL", "Scala", "VueJS", "Hadoop", "Spark", "Machine Learning", "Kotlin", "Flutter", "NLP", "AI", "Fullstack", "Frontend", "Backend", ".NET Developer", ".NET Web Developer", "Android App Developer", "Android Developer", "AngularJS Developer", "AngularJS Web Developer", "ASP.NET Developer", "ASP.NET Web Developer", "Back End Developer", "Back End Web Developer", "C Language Developer", "C# Developer", "C# Web Developer", "C++ Developer", "CSS Developer", "CSS Web Developer", "Database Administrator", "Django Developer", "Django Web Developer", "Drupal Developer", "Drupal Web Developer", "Embedded Developer", "Embedded Engineer", "ERP Developer", "ERP Specialist", "Front End Developer", "Front End Web Developer", "Full Stack Developer", "Full Stack Web Developer", "Games Developer", "Graphic Designer", "HTML5 Developer", "iOS App Developer", "iOS Developer", "IT Administrator", "J2EE Developer", "Java Developer", "Java Web Developer", "Javascript Developer", "Javascript Web Developer", "jQuery Developer", "JSON Developer", "Linux Developer", "Linux System Administrator", "Magento Developer", "Magento Web Developer", "Mobile Apps Developer", "MVC Developer", "MySQL Developer", "NodeJS Developer", "Objective C App Developer", "Objective C Developer", "OOP Developer", "Oracle Database Administrator", "Oracle DBA", "Oracle Developer", "PHP Developer", "PHP Web Developer", "Postgresql Database Administrator", "Postgresql Developer", "Product Owner", "Python Developer", "Python Web Developer", "QA QC Manager", "Quality Control Manager", "Quality Control Tester", "ReactJS Developer", "Ruby Developer", "Ruby On Rails Developer", "Ruby On Rails Web Developer", "Sales Engineer", "SAP Consultant", "Senior .NET Developer", "Senior Android App Developer", "Senior Android Developer", "Senior AngularJS Developer", "Senior ASP.NET Developer", "Senior Back End Developer", "Senior Bridge Engineer", "Senior Business Analyst", "Senior C Language Developer", "Senior C# Developer", "Senior C++ Developer", "Senior CSS Developer", "Senior Database Administrator", "Senior Designer", "Senior Django Developer", "Senior Drupal Developer", "Senior Embedded Developer", "Senior ERP Developer", "Senior Front End Developer", "Senior Full Stack Developer", "Senior Full Stack Web Developer", "Senior Games Developer", "Senior HTML5 Developer", "Senior iOS App Developer", "Senior iOS Developer", "Senior J2EE Developer", "Senior Java Developer", "Senior Javascript Developer", "Senior jQuery Developer", "Senior JSON Developer", "Senior Linux Developer", "Senior Magento Developer", "Senior Mobile Apps Developer", "Senior MVC Developer", "Senior MySQL Developer", "Senior Nodejs Developer", "Senior Objective C App Developer", "Senior Objective C Developer", "Senior OOP Developer", "Senior Oracle Developer", "Senior PHP Developer", "Senior Postgresql Database Administrator", "Senior Postgresql Developer", "Senior Product Manager", "Senior Product Owner", "Senior Project Manager", "Senior Python Developer", "Senior QA QC", "Senior Quality Control Tester", "Senior ReactJS Developer", "Senior Ruby Developer", "Senior Ruby On Rails Developer", "Senior Sales Engineer", "Senior Sharepoint Developer", "Senior Software Architect", "Senior SQL Administrator", "Senior SQL Developer", "Senior System Admin", "Senior System Engineer", "Senior Tester", "Senior Unity Developer", "Senior UX UI Designer", "Senior Windows Phone Developer", "Senior Wordpress Developer", "Senior XML Developer", "Sharepoint Developer", "Software Developer", "SQL Database Administrator", "SQL Developer", "System Administrator", "Unity Developer", "Unity Game Developer", "UX UI Designer", "Web Designer", "Web Developer", "Windows Phone Developer", "Wordpress Developer", "Wordpress Web Developer", "XML Developer"]);
    });

    app.post('/api/jobs/', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            Company.findOne({ user: user._id }, function (err, r) {
                if (r && r._id) {
                    if (req.body._id) {
                        var job = req.body;
                        delete job.status;
                        delete job.createdDate;
                        delete job.modifiedDate;
                        delete job.company;
                        delete job.user;
                        delete job.slug;
                        Job.findOne({ _id: job._id, user: user._id, company: r._id }).exec((function (err, jb) {
                            jb.modifiedDate = new Date();
                            jb.name = req.body.name;
                            jb.status = "PENDING";
                            jb.save(function (err1, r1) {
                                Job.updateOne({ _id: job._id, user: user._id, company: r._id }, job).exec((function (err, r) {
                                    res.json({ success: true, msg: "Job Updated Successful" });
                                }));
                            });
                        }));

                    } else {
                        var c = new Job(req.body);
                        c.createdDate = new Date();
                        c.user = user._id;
                        c.company = r._id;
                        c.status = "PENDING";
                        c.save(function (err1, r) {
                            if (err1) {
                                res.json({ success: false, msg: err1.message });
                            } else {
                                res.json({ success: true, msg: "Job Created Successful" });
                            }
                        });
                    }
                } else {
                    res.json({ success: false, msg: "Company not found" });
                }
            });
        } else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.post('/api/jobs/update/status', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            Company.findOne({ user: user._id }, function (err, r) {
                if (r && r._id) {
                    if (req.body._id && req.body.status) {
                        var job = req.body;
                        Job.findOne({ _id: job._id, user: user._id, company: r._id }).exec((function (err, jb) {
                            jb.modifiedDate = new Date();
                            if (jb.status !== "PENDING" && jb.status !== "REJECTED") {
                                if (req.body.status === "DISABLED" || req.body.status === "ACTIVE") {
                                    jb.status = req.body.status;
                                }
                            }
                            jb.save(function (err1, r1) {
                                res.json({ success: true, msg: "Job updated" });
                            });
                        }));
                    } else {
                        res.json({ success: false, msg: "_id and status requried" });
                    }
                } else {
                    res.json({ success: false, msg: "Company not found" });
                }
            });
        } else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/jobs/', function (req, res) {
        var location = req.query.location || '';
        var skip = parseInt(req.query.skip || 0);
        var limit = parseInt(req.query.limit || 25);
        
        var seachsOr = [];
        var tag = req.query.tags;
        var tags = [];

        function getSubArrays(arr) {
          var len = arr.length,
            subs = Array(Math.pow(2, len)).fill();
          return subs.map((_, i) => {
            var j = -1,
              k = i,
              res = [];
            while (++j < len) {
              k & 1 && res.push(arr[j]);
              k = k >> 1;
            }
            return res;
          }).slice(1);
        }
      
        if (tag) {
            tags = tag.split(',');

            var combinations = getSubArrays(tags);
            combinations.forEach(tagsMap => {
                if (tagsMap.length>1) {
                    var searchs = [{ location: location, status: 'ACTIVE' }];
                    searchs.push({ tags: { $all: tagsMap } });
                    seachsOr.push({ $and: searchs });
                }else {
                    seachsOr.push({ tags: tagsMap[0], location: location, status: 'ACTIVE' });
                }
            });
            // searchs.push({ tags: { $all: tags } });
            // tags.forEach(z => {
            //     seachsOr.push({ tags: z, location: location });
            // });
        }

        // var tagsSize = tags.length;
        // seachsOr.push({ $and: searchs });
        var total = 0;
        var data = [];

        var c = 0;
       

        Job.aggregate([
            { $match: { $or: seachsOr } },
            {
                $lookup: {
                    from: "companies",
                    localField: "company",
                    foreignField: "_id",
                    as: "company",
                }
            },
            {
                $unwind: "$company"
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    tags: 1,
                    location: 1,
                    level: 1,
                    rangeSalary: 1,
                    createdDate: 1,
                    "company._id": 1,
                    "company.name": 1,
                    "company.logo": 1,
                    "company.slug": 1,
                    tagMaping: {
                        $filter: {
                           input: "$tags",
                           as: "item",
                           cond: { $in: [ "$$item", tags ]}
                        }
                    }
                }
            },
            {
                $addFields: {
                    sortTagMapping: {
                        $size : "$tagMaping"
                    }
                }
            },
            {
                $sort: {
                    sortTagMapping: -1,
                }
            },{ '$facet': {
                metadata: [ { $count: "total" }],
                data: [ { $skip: skip}, { $limit: 25} ] // add projection here wish you re-shape the docs
            } }
        ]).allowDiskUse(true).exec(function (err, r) {
            if (r) {
                r = r[0];
            }
            if (r.metadata.length) {
                r.total = r.metadata[0].total;
            }else {
                r.total = 0;
            }
            r.results = r.data;
            delete r.data;
            delete r.metadata;
            res.json(r);
        });

        function d() {
            if (++c===1) {
                res.json(data);
            }
        }
    });

    app.get('/api/jobs/:slug', function (req, res) {
        Job.findOne({ slug: req.params.slug, status: 'ACTIVE' }).populate('company').exec(function (err, r) {
            if (r) {
                var text = htmlToText.fromString(r.content, {
                    wordwrap: 200,
                    unorderedListItemPrefix:"",
                    singleNewLineParagraphs:true
                });
                r.description = text.replace( /[\r\n]+/gm, " " ).slice(0,200);
            }
            res.json(r || {});
        });
    });

}

