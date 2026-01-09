import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EmployerNavbar from '../components/EmployerNavbar'

const candidateData: Record<string, any> = {
  'John Smith': {
    name: 'John Smith',
    role: 'Software Engineering Intern',
    team: 'Engineering Team',
    period: 'Jan 2024 - Present',
    email: 'john.smith@company.com',
    initials: 'JS',
    avatarColor: 'bg-purple-500',
    professionalSummary:
      'Passionate software engineering intern with a focus on full-stack development and data analysis. Eager to learn modern web technologies and contribute to impactful projects. Strong foundation in Python, JavaScript, and SQL with experience building RESTful APIs and interactive dashboards.',
    education: {
      university: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      gpa: '3.84/4.0',
      period: 'Sep 2021 - May 2025',
      coursework: [
        'Data Structures',
        'Algorithms',
        'Database Systems',
        'Machine Learning',
      ],
      achievements: [
        "Dean's List: Fall 2022, Spring 2023, Fall 2023",
        'Member of Computer Science Student Association',
      ],
    },
    experience: [
      {
        title: 'Software Engineering Intern (Intern)',
        team: 'Engineering Team',
        period: 'Jan 2024 - Present',
        manager: 'Jane Doe',
        responsibilities: [
          'Built RESTful API using Node.js and Express to handle 10,000+ daily requests',
          'Improved database query performance by 40% through index optimization',
          'Collaborated with cross-functional team of 5 to deliver features on tight deadlines',
          'Wrote comprehensive unit tests achieving 85% code coverage',
        ],
        linkedProjects: 2,
      },
    ],
    projects: [
      {
        title: 'Customer Analytics Dashboard - Lead Developer',
        linkedTo: 'Software Engineering Intern',
        period: 'Mar 2024 - Apr 2024',
        description:
          'Built interactive Tableau dashboard to track user engagement metrics across 50,000+ customers. Automated data pipeline using Python and SQL, reducing manual reporting time by 10 hours/week.',
        technologies: ['Tableau', 'SQL', 'Python'],
        githubLink: 'github.com/klpw',
      },
    ],
    skills: {
      technical: [
        { name: 'Python', level: 'Advanced', hours: 200, percentage: 100 },
        { name: 'JavaScript', level: 'Intermediate', canWorkIndependently: true, percentage: 70 },
        { name: 'SQL', level: 'Beginner', needsGuidance: true, percentage: 40 },
      ],
      business: [
        { name: 'Excel', level: 'Advanced', hours: 200, percentage: 100 },
      ],
    },
  },
}

export default function CandidateFullProfile() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const candidate = name ? candidateData[decodeURIComponent(name)] : null

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">Candidate not found</p>
        </div>
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState('Summary')

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div
              className={`w-20 h-20 ${candidate.avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-2xl`}
            >
              {candidate.initials}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-xl text-gray-600 mt-1">{candidate.role}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{candidate.team}</span>
                <span>•</span>
                <span>{candidate.period}</span>
                <span>•</span>
                <span>{candidate.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {['Summary', 'Education', 'Experience', 'Projects', 'Skills'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {activeTab === 'Summary' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Summary
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {candidate.professionalSummary}
              </p>
            </div>
          )}

          {activeTab === 'Education' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {candidate.education.university}
                </h3>
                <p className="text-gray-600">
                  {candidate.education.degree} | GPA: {candidate.education.gpa} |{' '}
                  {candidate.education.period}
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>
                  <strong>Relevant Coursework:</strong>{' '}
                  {candidate.education.coursework.join(', ')}
                </li>
                {candidate.education.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'Experience' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience</h2>
              {candidate.experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-gray-600">
                    {exp.team} | {exp.period} | Manager: {exp.manager}
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 text-gray-600">
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                  {exp.linkedProjects > 0 && (
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      {exp.linkedProjects} Projects linked to this experience
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Projects' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Projects</h2>
              {candidate.projects.map((project, index) => (
                <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="text-gray-600">
                    Linked to {project.linkedTo} | {project.period}
                  </p>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.githubLink && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Links & Repos
                      </p>
                      <a
                        href={`https://${project.githubLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{project.githubLink}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Skills' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills</h2>

              {/* Technical Skills */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Technical Skills
                </h3>
                <div className="space-y-4">
                  {candidate.skills.technical.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <span className="text-sm text-gray-600">
                          {skill.level}
                          {skill.hours && ` (${skill.hours}+ hours of practice)`}
                          {skill.canWorkIndependently && ' (Can work independently)'}
                          {skill.needsGuidance && ' (Learned basic needs guidance)'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${skill.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Skills */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Business Skills
                </h3>
                <div className="space-y-4">
                  {candidate.skills.business.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <span className="text-sm text-gray-600">
                          {skill.level}
                          {skill.hours && ` (${skill.hours}+ hours of practice)`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${skill.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

