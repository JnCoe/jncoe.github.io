/**
 * Projects Data
 * Portfolio of work and achievements
 */

export const projectsData = [
    {
        id: 'baltimore-roofs',
        title: 'Identifying collapsed roofs in Baltimore',
        description: 'Using deep learning and aerial imagery, I co-developed an algorithm to identify collapsing structures in Baltimore City.',
        image: 'images/pic07.jpg',
        tags: ['Deep Learning', 'PostgreSQL', 'Machine Learning', 'GIS'],
        technologies: [
            'images/PostgreSQL-PostGIS.svg',
            'images/Python-PyTorch.svg',
            'images/Python-Tensorboard.svg',
            'images/Python-Pandas-yellow.svg',
            'images/Python-Scikit Learn-yellow.svg',
            'images/Python-Pillow.svg'
        ],
        fullDescription: `
            <p>Abandoned and deteriorating buildings can pose a serious threat to public safety, as well as negatively impacting the structural integrity of neighboring homes. This is especially true for the majority of housing units in Baltimore, Maryland, which are row homes. As part of the Data Science for Social Good Fellowship at Carnegie Mellon University, my team partnered with the Baltimore City Department of Housing and Community Development (DHCD) to develop a system that used machine learning to score each address based on the severity of roof damage.</p>

            <p>We incorporated data from various sources, including aerial images and citizen hotline calls, to prioritize structures for remediation. Combining those datasets allowed us to create an algorithm using PyTorch that was able to identify collapsing units with a 91% precision rate. Recently, the DHCD received an innovation award for this project.</p>
        `,
        links: [
            { 
                url: 'https://github.com/JnCoe/baltimore_roofs_public', 
                text: 'GitHub Repository',
                icon: 'fab fa-github'
            },
            { 
                url: 'https://www.cmu.edu/news/stories/archives/2023/february/making-meaningful-impact-using-data-science-for-social-good', 
                text: 'CMU Blog',
                icon: 'fas fa-newspaper'
            },
            { 
                url: 'https://mayor.baltimorecity.gov/news/press-releases/2023-01-17-dhcd-receives-maryland-association-counties-innovation-award', 
                text: 'Baltimore City Blog',
                icon: 'fas fa-newspaper'
            },
            { 
                url: 'https://www.dssgfellowship.org/project/improving-community-safety-and-economic-well-being-by-remediating-buildings-with-roof-damage-in-baltimore/', 
                text: 'Project page on DSSG',
                icon: 'fas fa-link'
            }
        ]
    },
    {
        id: 'secret-budget',
        title: 'Misuse of public funding in education',
        description: 'By analyzing budgetary data from the Brazilian Federal Government and combining it with other databases, I identified and reported potential irregularities.',
        image: 'images/pic08.jpg',
        tags: ['Data visualization', 'ETL', 'Data analysis', 'Writing'],
        technologies: [
            'images/R-Tidyverse-blue.svg',
            'images/R-RMarkdown-blue.svg',
            'images/R-GoogleVis-blue.svg',
            'images/R-Matchit.svg',
            'images/AWK-FCC624.svg'
        ],
        fullDescription: `
            <p>The Brazilian Federal Government finances the construction of daycares and schools throughout the entire country with its vast territory. In 2020, a new budgetary tool emerged, significantly transforming the way money is distributed, reducing transparency, and encouraging the misappropriation of public funds.</p>

            <p>In this report (in Portuguese), I used budget data and other sources to observe patterns in this new financing format and identify potential irregularities. I utilized the AWK tool to filter unnecessary files without the need to set up a server and then processed them in R. The report exclusively revealed a series of scandals that received coverage on Jornal Nacional, the most-watched news show on Brazilian television, along with other press vehicles.</p>
        `,
        links: [
            { 
                url: 'https://github.com/Transparencia-Brasil/creches-rp9', 
                text: 'GitHub Repository',
                icon: 'fab fa-github'
            },
            { 
                url: 'https://g1.globo.com/jornal-nacional/noticia/2022/12/19/orcamento-secreto-contribuiu-para-ma-gestao-de-recursos-de-obras-na-area-da-educacao-diz-relatorio.ghtml', 
                text: 'Jornal Nacional',
                icon: 'fas fa-newspaper'
            },
            { 
                url: 'https://g1.globo.com/economia/de-olho-no-orcamento/noticia/2022/10/20/orcamento-secreto-fnde-destinou-r-423-milhoes-a-obras-de-escolas-e-creches-sem-aprovacao-diz-levantamento.ghtml', 
                text: 'Globo News',
                icon: 'fas fa-newspaper'
            },
            { 
                url: 'https://educacao.uol.com.br/noticias/2022/12/16/orcamento-secreto-escolas-creches-executivo-congresso-transparencia-brasil.htm', 
                text: 'UOL',
                icon: 'fas fa-newspaper'
            },
            { 
                url: 'https://www.transparencia.org.br/downloads/publicacoes/relatriooramentosecretoecreches.pdf', 
                text: 'PDF Report (Portuguese)',
                icon: 'fas fa-file-pdf'
            }
        ]
    },
    {
        id: 'teachers-inequality',
        title: 'Wage Inequality Among São Paulo\'s Teachers',
        description: 'Using data from the municipal and federal level, I analyzed the socioeconomic disparities of public schools in São Paulo according to the wages paid to teachers in each school.',
        image: 'images/pic01.jpg',
        tags: ['Data visualization', 'Statistics', 'Tableau', 'Data analysis'],
        technologies: [
            'images/R-Tidyverse-blue.svg',
            'images/R-RMarkdown-blue.svg',
            'images/AWK-FCC624.svg'
        ],
        fullDescription: `
            <p>The city of São Paulo has a vast public education network spread across its extensive territory. However, the city is also the stage for a large scenario of inequality, with the highest incomes in the country occupying the city center while people with high levels of socio-economic vulnerability live in the suburbs.</p>

            <p>In this report, I analyzed demographic data of students enrolled in the entire municipal public network, comparing it with the average wages of teachers at each school. The result, although not surprising, is still shocking: schools in the poorest areas of the city, with the highest proportion of black students, also have teachers with considerably lower wages. This scenario is alarming because the municipal education network theoretically has wage equity, meaning all teachers receive the same value, regardless of where they work. However, some practical details end up distorting this principle.</p>

            <p>The report received extensive media coverage, including a feature on SPTV (the local news TV show with the highest viewership in the state) and on Folha de São Paulo (one of the largest newspapers in the country).</p>
        `,
        links: [
            { 
                url: 'https://github.com/Transparencia-Brasil/escolas-sp', 
                text: 'GitHub Repository',
                icon: 'fab fa-github'
            },
            { 
                url: 'https://globoplay.globo.com/v/9585718/', 
                text: 'SPTV',
                icon: 'fas fa-tv'
            },
            { 
                url: 'https://www1.folha.uol.com.br/educacao/2021/07/professores-de-escolas-na-periferia-e-com-mais-alunos-negros-ganham-menos-em-sp.shtml', 
                text: 'Folha de São Paulo',
                icon: 'fas fa-newspaper'
            },
            { 
                url: 'https://www.transparencia.org.br/downloads/publicacoes/ProfessoreseTerritorios-Publicacao.pdf', 
                text: 'PDF Report (Portuguese)',
                icon: 'fas fa-file-pdf'
            }
        ]
    },
    {
        id: 'real-estate-scraper',
        title: 'Scraping information from real estate websites',
        description: 'In this basic personal Python project I created a scraper for two real estate websites to collect info on available units and store it in a spreadsheet.',
        image: 'images/pic11.jpg',
        tags: ['Web Scraping', 'Logging', 'YAML', 'Open Source'],
        technologies: [
            'images/Python-Pandas-yellow.svg',
            'images/Python-Selenium.svg',
            'images/Python-Pygsheets.svg'
        ],
        fullDescription: `
            <p>Finding a new home can be a daunting task. While much of the process is done digitally, the largest rental property websites still lack features that make it easy for those searching for a place to live.</p>

            <p>For this reason, I developed a simple scraper for the two main real estate sites in Brazil while searching for a new apartment. When executed, it will gather information on all available rental properties with selected specifications and save new offers to a Google Sheets spreadsheet, along with a log of each execution.</p>
        `,
        links: [
            { 
                url: 'https://github.com/JnCoe/corretor-virtual', 
                text: 'GitHub Repository',
                icon: 'fab fa-github'
            }
        ]
    },
    {
        id: 'latin-america-transparency',
        title: 'Public Transparency in Latin America',
        description: 'On this article published in Government Information Quarterly, I explored over 300 transparency evaluations in Latin America to highlight patterns and biases in the way that governments are evaluated.',
        image: 'images/pic09.jpg',
        tags: ['Data visualization', 'ETL', 'Data analysis', 'Writing'],
        technologies: [],
        fullDescription: `
            <p>In this study, me and my co-authors have conducted a comprehensive analysis of 265 transparency compliance evaluations conducted by NGOs, academics, and government oversight authorities across Latin America between 2003 and 2018. Our study sheds light on the compliance of Latin American governments with their own transparency statutes. We found that compliance has modestly improved over time, but there is still a significant lack of compliance with passive transparency at the local level compared to the national level. Additionally, our data shows that evaluations done by government oversight agencies tend to obtain higher scores.</p>

            <p>Furthermore, our study highlights significant gaps in evaluation efforts, particularly in the evaluation of passive transparency. Our study is the first large-scale cross-national assessment of transparency compliance in Latin America and was only possible after intense work on data collection and standardization that allowed us to perform data analysis and visualization on this database.</p>
        `,
        links: [
            { 
                url: 'https://www.sciencedirect.com/science/article/abs/pii/S0740624X21000010', 
                text: 'Article (Science Direct)',
                icon: 'fas fa-link'
            },
            { 
                url: 'https://scholar.google.com/citations?view_op=view_citation&hl=pt-BR&user=xIy85KgAAAAJ&citation_for_view=xIy85KgAAAAJ:u-x6o8ySG0sC', 
                text: 'Google Scholar metrics',
                icon: 'fas fa-graduation-cap'
            }
        ]
    },
    {
        id: 'masters-thesis',
        title: 'The interaction between transparency and education',
        description: 'In my master\'s thesis, I used a propensity score matching to understand the potential impacts that public transparency could have on education.',
        image: 'images/pic10.jpg',
        tags: ['Causal inference', 'Statistics', 'Academic Writing', 'Data analysis'],
        technologies: [
            'images/R-Tidyverse-blue.svg',
            'images/R-Matchit.svg'
        ],
        fullDescription: `
            <p>In my master's thesis, I meticulously investigated three distinct forms of transparency and their corresponding levels of government adherence to these policies at the municipal level. The primary objective was to assess the influence of transparency on public administration outcomes, with a specific focus on the impact of varying transparency types on municipal-level public education in Brazil.</p>

            <p>To accomplish this, I initially employed Data Envelopment Analysis (DEA) to quantify the efficiency of education expenditures. This required the careful acquisition, cleaning, and processing of multiple sets of public administration databases for over 5,500 Brazilian municipalities. Next, I conducted a Propensity Score Matching analysis to evaluate the effect of transparency on education, utilizing the Brazilian National Index of Primary Education (IDEB) as a metric.</p>
        `,
        links: [
            { 
                url: 'https://bibliotecadigital.fgv.br/dspace/bitstream/handle/10438/30849/Jonas Coelho - MSc Thesis - vers%c3%a3o biblioteca.pdf?sequence=1&isAllowed=y', 
                text: 'PDF Thesis (English)',
                icon: 'fas fa-file-pdf'
            }
        ]
    }
];

