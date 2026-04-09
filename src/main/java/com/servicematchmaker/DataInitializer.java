package com.servicematchmaker;

import com.servicematchmaker.model.Event;
import com.servicematchmaker.model.Volunteer;
import com.servicematchmaker.repository.EventRepository;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(VolunteerRepository volunteerRepo, EventRepository eventRepo) {
        return args -> {
            // Only seed if tables are empty (safe for re-runs)
            if (volunteerRepo.count() == 0) {
                Volunteer v1 = new Volunteer();
                v1.setName("Demo User"); v1.setEmail("demo@demo.com"); v1.setPassword("demo");
                v1.setSkills("Java, Spring Boot, React"); v1.setHoursLogged(42.5);

                Volunteer v2 = new Volunteer();
                v2.setName("Alice S"); v2.setEmail("alice@demo.com"); v2.setPassword("demo");
                v2.setSkills("JavaScript, React, CSS"); v2.setHoursLogged(28.0);

                Volunteer v3 = new Volunteer();
                v3.setName("Bob Jensen"); v3.setEmail("bob@demo.com"); v3.setPassword("demo");
                v3.setSkills("Python, Django, SQL"); v3.setHoursLogged(15.0);

                Volunteer v4 = new Volunteer();
                v4.setName("Priya Sharma"); v4.setEmail("priya@demo.com"); v4.setPassword("demo");
                v4.setSkills("React, Node.js, MongoDB"); v4.setHoursLogged(36.0);

                Volunteer v5 = new Volunteer();
                v5.setName("Carlos Rivera"); v5.setEmail("carlos@demo.com"); v5.setPassword("demo");
                v5.setSkills("Java, Python, Leadership"); v5.setHoursLogged(55.0);

                volunteerRepo.save(v1); volunteerRepo.save(v2); volunteerRepo.save(v3);
                volunteerRepo.save(v4); volunteerRepo.save(v5);
                System.out.println("✅ Seeded 5 volunteers.");
            }

            if (eventRepo.count() == 0) {
                String[][] events = {
                    {"Community Cleanup Drive",       "Help restore the local park and waterfront areas.",                 "Java",                  "10", "5", "4",  "UPCOMING"},
                    {"Web Dev Bootcamp",              "Teach beginners the fundamentals of JavaScript and React.",          "JavaScript, React",     "5",  "3", "6",  "UPCOMING"},
                    {"Spring Boot Mentorship",        "Guide junior devs through REST API design and Spring Boot.",         "Java, Spring Boot",     "4",  "2", "8",  "UPCOMING"},
                    {"Python Data Science Workshop",  "Mentoring session covering pandas, scikit-learn and visualizations.","Python",                "3",  "1", "5",  "UPCOMING"},
                    {"UI/UX Design Sprint",           "Collaborate on a real-world mobile app design challenge.",           "CSS, React",            "6",  "4", "3",  "UPCOMING"},
                    {"Hackathon Mentorship Weekend",  "Coach student teams through an intense 24h hackathon experience.",   "React, Java, Python",   "12", "7", "24", "UPCOMING"},
                    {"SQL Workshop",                  "Hands-on relational database design using MySQL and PostgreSQL.",    "SQL",                   "8",  "3", "4",  "UPCOMING"},
                    {"Leadership & Soft Skills",      "Workshops on public speaking, project management and leadership.",   "Leadership",            "15", "9", "3",  "COMPLETED"},
                    {"Accessibility in Tech",         "An event about building inclusive web applications with A11Y.",       "React, CSS",            "5",  "5", "5",  "COMPLETED"},
                };

                for (String[] e : events) {
                    Event ev = new Event();
                    ev.setTitle(e[0]); ev.setDescription(e[1]); ev.setRequiredSkill(e[2]);
                    ev.setRequiredVolunteers(Integer.parseInt(e[3]));
                    ev.setCurrentVolunteers(Integer.parseInt(e[4]));
                    ev.setDuration(Integer.parseInt(e[5]));
                    ev.setStatus(e[6]);
                    eventRepo.save(ev);
                }
                System.out.println("✅ Seeded 9 events.");
            }
        };
    }
}
