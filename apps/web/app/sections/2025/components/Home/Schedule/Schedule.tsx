import {
  Box,
  Flex,
  HStack,
  Image,
  Spacer,
  Text,
  useToast
} from "@chakra-ui/react";
import type { Event } from "@app";
import { circleColors, DayEvent } from "@app";
import moment from "moment-timezone";
import { useCallback, useEffect, useState } from "react";

import { AnimatedHeader } from "../shared/AnimatedHeader";
import { AudioVisualizer } from "./AudioVisualizer";
import EventModal from "./EventModal";
import { RaceTrack } from "./RaceTrack";
import ScheduleDaySelector from "./ScheduleDaySelector";

const EventsData: Event[] = [
	{
		"eventId": "174a84db-412d-4e24-b0ad-15baa3815151",
		"name": "Joana Moll: The Interface Inside",
		"startTime": "2025-09-19T22:30:00+00:00",
		"endTime": "2025-09-19T23:30:00+00:00",
		"points": 10,
		"description": "In 2012, a viral video showed a one-year-old trying to swipe, pinch, and zoom on a paper magazine, frustrated when nothing happened. Her parent ended the clip with a striking remark: “Steve Jobs has coded a part of her operating system.” This talk explores how technology inscribes itself into our bodies, gestures, and imaginations, and how artistic practice reveals the hidden entanglements of technology, ideology, materiality, and capital in the age of data extraction.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 1302",
		"isVisible": true,
		"attendanceCount": 26,
		"eventType": "SPEAKER",
		"tags": [
			"Research",
			"Art/Media"
		]
	},
	{
		"eventId": "8852aff5-015a-40b2-a32b-f1f738db34c8",
		"name": "Sue Harnett: Rewriting The Tech Industry- A Look Ahead",
		"startTime": "2025-09-16T22:30:00+00:00",
		"endTime": "2025-09-16T23:30:00+00:00",
		"points": 15,
		"description": "Join us for our keynote speaker, the founder and CEO of Rewriting The Code! Sue will be discussing the current state of the tech industry and how to prepare for its future.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 35,
		"eventType": "SPEAKER",
		"tags": [
			"Career Readiness",
			"Networking"
		]
	},
	{
		"eventId": "72c1c5fc-cd7a-4339-a893-cfd52827dd0d",
		"name": "MechMania",
		"startTime": "2025-09-19T21:00:00+00:00",
		"endTime": "2025-09-20T02:00:00+00:00",
		"points": 0,
		"description": "MechMania is a 24-hour hackathon where participants compete to create a bot that can best play a custom game. This event is sponsored by Caterpillar. Get mentorship on your project from Caterpillar engineers and learn more about recruiting from the early career team. For more information, go to MechMania's official website, mechmania.org.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 1404",
		"isVisible": true,
		"attendanceCount": 2,
		"eventType": "SPECIAL",
		"tags": []
	},
	{
		"eventId": "3a468428-34ae-4bf2-8358-ecdedbc45d51",
		"name": "Eva Galperin: Hey Siri, Find My Ex- Threat Modeling for Domestic Abuse",
		"startTime": "2025-09-16T20:00:00+00:00",
		"endTime": "2025-09-16T21:00:00+00:00",
		"points": 10,
		"description": "When we talk about cybersecurity, we usually talk about securing networks and devices. We rarely talk about securing people. This talk will discuss the ways in which apps, platforms, and devices are used as tools of coercive control by domestic abusers, why this is such a blind spot for people developing technology, and how we can make products that are resistant to being used for coercive control.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 19,
		"eventType": "SPEAKER",
		"tags": [
			"Ethics",
			"Cybersecurity"
		]
	},
	{
		"eventId": "9c86037a-023e-4029-b408-e242948597ad",
		"name": "Sue Harnett x WCS: Recruiting Advice Session",
		"startTime": "2025-09-17T17:30:00+00:00",
		"endTime": "2025-09-17T18:30:00+00:00",
		"points": 10,
		"description": "Join us for our collaboration event with Women in Computer Science! Sue Harnett, the founder of Rewriting The Code and our keynote speaker, will be hosting an informal networking and advice session. Ask Sue questions, meet people, and learn strategies for navigating the tech industry as someone from an underrepresented background. Brunch will also be served!",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 18,
		"eventType": "PARTNERS",
		"tags": [
			"Career Readiness",
			"Networking",
			"Interactive Events"
		]
	},
	{
		"eventId": "21a381b9-f6ba-4ef6-94db-18a7575bfc52",
		"name": "Creative Intelligence Panel: Art in the Age of AI",
		"startTime": "2025-09-17T23:30:00+00:00",
		"endTime": "2025-09-18T00:30:00+00:00",
		"points": 15,
		"description": "Step into the future of creativity!  Join Michael Schrenk, Josh Antonuccio, Sharath Ramakrishnan, and Eliot Chang as they dive into how AI is transforming art, music, games, and storytelling—revealing the risks, rewards, and what creativity will mean in the age of AI.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 48,
		"eventType": "SPECIAL",
		"tags": [
			"AI",
			"Interactive Events",
			"Art/Media"
		]
	},
	{
		"eventId": "1cfa86e1-c4ee-462b-b1ec-08934421f9d4",
		"name": "Josh Antonuccio: The New Frontier in Creativity- AI and Music Production",
		"startTime": "2025-09-17T19:00:00+00:00",
		"endTime": "2025-09-17T20:00:00+00:00",
		"points": 10,
		"description": "In this interactive workshop, we’ll explore how artificial intelligence is reshaping music creation, production, and performance. From AI-driven songwriting and lyric generation to virtual performers and cutting-edge production tools, we’ll dive into the technologies and trends rewriting the rules of creativity. Attendees will gain hands-on insight into how today’s artists and producers are using these innovations and what it means for the future of the creative industries.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 15,
		"eventType": "SPEAKER",
		"tags": [
			"AI",
			"Art/Media"
		]
	},
	{
		"eventId": "25557f84-b246-4038-844b-61dfc7a576ae",
		"name": "Mehdi Bahrami: A Hands-On Workshop- Building Advanced AI Applications and Agents",
		"startTime": "2025-09-17T22:30:00+00:00",
		"endTime": "2025-09-17T23:30:00+00:00",
		"points": 10,
		"description": "Unlock the power of AI in this hands-on workshop! Gain a solid foundation in transformer models and learn to build intelligent agents with LLMs and VLMs for real-world tasks, from automation to decision-making. Explore open-source models, fine-tuning, integration, scalability, and ethics. Leave equipped to design and deploy your first full-stack AI agent in this live session.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 47,
		"eventType": "SPEAKER",
		"tags": [
			"AI",
			"Interactive Events"
		]
	},
	{
		"eventId": "2239c998-375f-4825-a211-664f394abacd",
		"name": "Michael Schrenk: Competitive Intelligence- Working with Rogue Data",
		"startTime": "2025-09-17T20:00:00+00:00",
		"endTime": "2025-09-17T21:00:00+00:00",
		"points": 10,
		"description": "Competitive Intelligence discovers competitive advantages from information that other organizations either ignore, or don’t have the wherewithal to process. This talk describes techniques and stories from thirty years in the field.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 13,
		"eventType": "SPEAKER",
		"tags": [
			"Ethics",
			"Research",
			"Cybersecurity"
		]
	},
	{
		"eventId": "bc1d8f5e-f664-4da3-bbb1-2e7e0fec6e2c",
		"name": "Opening Ceremony",
		"startTime": "2025-09-16T18:30:00+00:00",
		"endTime": "2025-09-16T19:00:00+00:00",
		"points": 5,
		"description": "Join us at the starting line of Reflections | Projections 2025! We’ll take a lap through the history of R|P and give you a preview of the exciting week ahead. The R|P Grand Prix starts here!",
		"isVirtual": false,
		"imageUrl": "http://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 17,
		"eventType": "SPECIAL",
		"tags": [
			"Networking"
		]
	},
	{
		"eventId": "7a4da959-eee8-432f-be38-e0f3dcf19ebc",
		"name": "HRT Tech Talk",
		"startTime": "2025-09-19T23:30:00+00:00",
		"endTime": "2025-09-20T00:30:00+00:00",
		"points": 15,
		"description": "Hudson River Trading is excited to be at UIUC! We’re hosting a tech talk with R|P, and we’d love for you to join us to learn more about HRT. You’ll hear directly from HRTers across our software engineering and hardware engineering teams as they share insights into their work and career paths. Food and swag will be provided!",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 46,
		"eventType": "CORPORATE",
		"tags": [
			"Company Talk",
			"Networking"
		]
	},
	{
		"eventId": "c461b507-9be4-4cb8-8b8c-12e528c3a315",
		"name": "PuzzleBang Escape Boxes",
		"startTime": "2025-09-20T14:30:00+00:00",
		"endTime": "2025-09-21T00:00:00+00:00",
		"points": 10,
		"description": "Enjoy escape rooms? Well, do we have the thing for you! Gather your team of 2-4 gamers, solve the puzzles, unlock the locks, and claim your prize. Race against the clock and see if you have what it takes to figure out PuzzleBang's Suspicious Garage!",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 1302/1304",
		"isVisible": true,
		"attendanceCount": 0,
		"eventType": "SPECIAL",
		"tags": [
			"Interactive Events"
		]
	},
	{
		"eventId": "eba6b352-a0c5-4bb0-8273-549f6026d5eb",
		"name": "Career Fair",
		"startTime": "2025-09-18T19:00:00+00:00",
		"endTime": "2025-09-18T23:30:00+00:00",
		"points": 10,
		"description": "Looking for a career in the tech industry? Stop by Siebel to meet representatives from top tier technology companies. No need to dress formal, just bring your best self!\n\nFeatured companies: HRT, Caterpillar, Qualcomm, Aechelon Technology, John Deere, Everfox, Cloudflare, State Farm.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel First Floor Atrium",
		"isVisible": true,
		"attendanceCount": 73,
		"eventType": "CORPORATE",
		"tags": []
	},
	{
		"eventId": "0b1f98f6-3462-46c3-ae48-0b67cf24f8f0",
		"name": "Shubha Jagannatha: Software as an Art",
		"startTime": "2025-09-19T19:30:00+00:00",
		"endTime": "2025-09-19T20:30:00+00:00",
		"points": 10,
		"description": "An inside look at my journey to reconcile dual identities as an artist and engineer: from engineering student to Pixar to founding a creative tech startup. I  believe that software isn’t just a tool: it’s an entire medium, like music, and there’s a massive frontier of expression ahead for this art form. Expect stories, frameworks, and passionate rambling on finding a career that fits your shape.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 1304",
		"isVisible": true,
		"attendanceCount": 22,
		"eventType": "SPEAKER",
		"tags": [
			"Art/Media"
		]
	},
	{
		"eventId": "0a469c65-1c5d-4dc9-a11f-12fe400a9b52",
		"name": "Capital One Social Event",
		"startTime": "2025-09-16T21:30:00+00:00",
		"endTime": "2025-09-16T22:30:00+00:00",
		"points": 10,
		"description": "Capital One is one of the most widely recognized brands in banking, serving more than 100 million customers across a diverse set of businesses. Join us for an exciting social event hosted by Capital One! Connect with representatives in a relaxed setting, expand your network and learn more about opportunities at the company.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 39,
		"eventType": "CORPORATE",
		"tags": [
			"Networking"
		]
	},
	{
		"eventId": "c1918795-9277-4f4c-adb2-32d8d9a07a3a",
		"name": "Ben Grosser: Tactics of Resistance in a Platform World",
		"startTime": "2025-09-18T19:00:00+00:00",
		"endTime": "2025-09-18T20:00:00+00:00",
		"points": 10,
		"description": "From social media’s like counts to AI chatbots affirmations, today’s platform interfaces shape behavior, desire, and experience. This talk presents artworks that intervene in, reflect on, and reimagine the apps we use every day, exposing how they extract and induce engagement while proposing alternatives that center human agency.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 8,
		"eventType": "SPEAKER",
		"tags": [
			"Art/Media",
			"Ethics"
		]
	},
	{
		"eventId": "31095aca-b77a-4e3a-b239-3827d5bb7aec",
		"name": "Eliot Chang: Shaping Culture with Software",
		"startTime": "2025-09-18T21:00:00+00:00",
		"endTime": "2025-09-18T22:00:00+00:00",
		"points": 10,
		"description": "Traditionally, software has been associated with hyper-scale, venture-backed B2B SaaS startups focused on maximizing efficiency. But software can also be a medium for shaping culture—creating new perspectives, shared experiences, and playful social experiments. From r/place and the Million Dollar Homepage to Club Penguin and RuneScape, these projects show that software’s impact goes far beyond productivity—it can connect people, spark creativity, and redefine how we interact online.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 27,
		"eventType": "SPEAKER",
		"tags": [
			"Art/Media",
			"AI",
			"Career Readiness"
		]
	},
	{
		"eventId": "7ea2abf3-0f5a-45dd-ac98-89b42f376ba0",
		"name": "Qualcomm Tech Talk: The Future of AI is Hybrid",
		"startTime": "2025-09-17T21:30:00+00:00",
		"endTime": "2025-09-17T22:30:00+00:00",
		"points": 15,
		"description": "Join us for a session on running AI on-device and learn how Qualcomm makes it possible. We’ll explore Qualcomm’s AI software stack, as well as our university relations program and opportunities for students. The talk will also feature a few hands-on demos, giving students the chance to experiment with GenAI models running locally on Qualcomm hardware.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 40,
		"eventType": "CORPORATE",
		"tags": [
			"Networking",
			"Company Talk",
			"Interactive Events",
			"AI"
		]
	},
	{
		"eventId": "548d9004-95d0-43bc-9025-4e1ebd5c1e9a",
		"name": "Claire Liang: Robotics- Putting the Human First",
		"startTime": "2025-09-18T20:00:00+00:00",
		"endTime": "2025-09-18T21:00:00+00:00",
		"points": 10,
		"description": "Robotics today is more prolific than it has ever been. There are real robots in real spaces, from airport guides to self-driving vehicles. In this talk, I argue that in our current era of ubiquitous robotics, the study of human robot interaction is not only more relevant than ever but also absolutely necessary before any robot deployment makes it into the real world.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 18,
		"eventType": "SPEAKER",
		"tags": [
			"HCI",
			"Research"
		]
	},
	{
		"eventId": "6e3e9531-cbff-47c4-a815-40cc4b354861",
		"name": "Lionel Robert: Autonomous Driving- Steering Society Towards a New Horizon",
		"startTime": "2025-09-18T22:00:00+00:00",
		"endTime": "2025-09-18T23:00:00+00:00",
		"points": 10,
		"description": "As autonomous vehicles transition from concept to reality, they promise to revolutionize the very fabric of society. This talk explores the societal implications of this technology—from reshaping urban landscapes and reducing traffic fatalities to redefining employment and ethical decision-making. We’ll delve into the opportunities and challenges that lie ahead, questioning how this technological leap will impact equity, privacy, and the way we live, work, and connect.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 26,
		"eventType": "SPEAKER",
		"tags": [
			"Research",
			"HCI",
			"Autonomous Vehicles",
			"Ethics"
		]
	},
	{
		"eventId": "e73a6468-0cc7-46c5-a2c7-cd7fc85f891d",
		"name": "Aechelon Tech Talk: Project Orbion",
		"startTime": "2025-09-16T23:30:00+00:00",
		"endTime": "2025-09-17T00:30:00+00:00",
		"points": 15,
		"description": "The proliferation of drones and Low-Earth-Orbit satellites has created a tidal wave of terrestrial imagery: a flood of data too great for human cognition.  Come see how Aechelon Technology’s Summer 2025 Interns helped bring Earth’s Digital Twin to life with a new LUA behavior engine, Broadcast-quality video streaming with SMPTE 2110, and 3D projection of drone video streams.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 49,
		"eventType": "CORPORATE",
		"tags": [
			"Company Talk",
			"Networking"
		]
	},
	{
		"eventId": "af789f27-0792-49b0-9db8-65fc5ffff1d9",
		"name": "Check-In",
		"startTime": "2025-09-16T05:00:00+00:00",
		"endTime": "2025-09-21T01:00:00+00:00",
		"points": 0,
		"description": "Check In for R|P 2025",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "ACM",
		"isVisible": false,
		"attendanceCount": 797,
		"eventType": "CHECKIN",
		"tags": []
	},
	{
		"eventId": "e553a2a0-18a8-401d-bd98-fa9b7b4f2f8a",
		"name": "MechMania",
		"startTime": "2025-09-20T13:00:00+00:00",
		"endTime": "2025-09-20T23:30:00+00:00",
		"points": 0,
		"description": "MechMania is a 24-hour hackathon where participants compete to create a bot that can best play a custom game. This event is sponsored by Caterpillar. Get mentorship on your project from Caterpillar engineers and learn more about recruiting from the early career team. For more information, go to MechMania's official website, mechmania.org.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 1404",
		"isVisible": true,
		"attendanceCount": 1,
		"eventType": "SPECIAL",
		"tags": []
	},
	{
		"eventId": "3e58f707-6341-45b3-9915-0ea339f0ad64",
		"name": "Juan Pablo Hourcade: Human Factors, Computing, and Children",
		"startTime": "2025-09-19T21:30:00+00:00",
		"endTime": "2025-09-19T22:30:00+00:00",
		"points": 10,
		"description": "Human factors have been involved in key changes in computing, making processes more efficient, applicable, and accessible. This has impacted even young children, not always in a positive way. Hourcade will present a vision for children’s technologies that contrasts with prevailing industry approaches and presents an example that aligns with this vision. He concludes by discussing key guidelines for designing technologies for children.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 1304",
		"isVisible": true,
		"attendanceCount": 24,
		"eventType": "SPEAKER",
		"tags": [
			"Research",
			"HCI"
		]
	},
	{
		"eventId": "3d484ba4-820a-4644-8a14-11831942cfed",
		"name": "Abdu Alawini: Exploring Impact and Potential of Gen AI in Engineering Education",
		"startTime": "2025-09-16T19:00:00+00:00",
		"endTime": "2025-09-16T20:00:00+00:00",
		"points": 10,
		"description": "This talk examines the potential impact and benefits of Generative AI on engineering education. The audience will be introduced to our work on an AI-powered personalized learning system that enhances student engagement and feedback. Using large language models, the system generates concept maps that capture key topics, principles, and relationships in a course. Linked with student submissions, these maps form a knowledge graph that tracks progress, delivers tailored feedback, highlights strengths and areas for growth, and recommends targeted resources and practice.",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 15,
		"eventType": "SPEAKER",
		"tags": [
			"AI"
		]
	},
	{
		"eventId": "419cac22-ca7d-47e5-8484-1fbb007ddd63",
		"name": "Driving Innovation Showcase Sponsored by Qualcomm",
		"startTime": "2025-09-18T23:30:00+00:00",
		"endTime": "2025-09-19T00:30:00+00:00",
		"points": 10,
		"description": "Join us at R|P's very first startup showcase, where you get the chance to pitch your startup ideas in front of Qualcomm engineers! Get practice with your pitch and gain feedback/insight on how to move forward. Your startup can be an idea or a full-fledged product, all you need is a short pitch! All participants will get free dinner and Qualcomm will pick a winning team to earn an exclusive prize. To sign up to pitch your startup idea, fill out this interest form: bit.ly/rp-2025-innovation\n\n:link: https://bit.ly/rp-2025-innovation | Interest Form",
		"isVirtual": false,
		"imageUrl": "https://docs.google.com/forms/d/e/1FAIpQLSend8DXWCcSdEKw-uJfkoFrNptTx3cEOuHHKHJ86ltaHFwDlg/viewform?usp=dialog",
		"location": "Siebel 2405",
		"isVisible": true,
		"attendanceCount": 24,
		"eventType": "CORPORATE",
		"tags": [
			"Interactive Events",
			"Networking"
		]
	},
	{
		"eventId": "61499424-5e82-49bb-bcb7-c1cdd385a139",
		"name": "Tuesday Dinner Sponsored By Aechelon",
		"startTime": "2025-09-17T00:30:00+00:00",
		"endTime": "2025-09-17T01:30:00+00:00",
		"points": 0,
		"description": "Join us for free dinner sponsored by Aechelon! Eat, mingle with attendees, and network with company representatives. Attendees who have attended an event earlier in the day receive priority status and will be served first.\n\nJoin us for yummy pizza from Papa Del's!\n\n:food:\nhttps://bluebowlrecipes.com/wp-content/uploads/2019/05/barbecue-chicken-pizza-0917.jpg | Chicken Pizza | Non-Veg, Contains Gluten, Contains Dairy\nhttps://arecipeforfun.com/wp-content/uploads/2025/03/Edits-Turkey-Pepperoni-Pizza-Recipe-14.jpg | Pepperoni Pizza | Non-Veg, Contains Gluten, Contains Dairy\nhttps://cdn.theliveinkitchen.com/wp-content/uploads/2023/04/18140614/Onion-and-Green-Pepper-Pizza-The-Live-In-Kitchen-1.jpg | Green Pepper and Onion | Vegetarian, Contains Gluten, Contains Dairy\nhttps://www.pizzahut.com/images/nationalMenu/pizza/Pizza_ProductTile_CHEESE.jpg | Cheese Pizza | Vegetarian, Contains Gluten, Contains Dairy\nhttps://bjsrestaurants.scene7.com/is/image/bjsrestaurants/pizzas-gf-cheese-pizza | Gluten Free Cheese Pizza | Vegetarian, Contains Dairy\nhttps://makeitdairyfree.com/wp-content/uploads/2019/01/dairy-free-cheese-pizza-vegan-8.jpg | Vegan Cheese Pizza | Vegan\n:menu: https://www.papadels.com/ ",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel Second Floor Atrium",
		"isVisible": true,
		"attendanceCount": 145,
		"eventType": "MEALS",
		"tags": []
	},
	{
		"eventId": "e636a775-f0f1-41a1-b1e2-3bfc4fa18725",
		"name": "Thursday Dinner Sponsored By John Deere",
		"startTime": "2025-09-19T00:30:00+00:00",
		"endTime": "2025-09-19T01:30:00+00:00",
		"points": 0,
		"description": "Join us for free dinner sponsored by John Deere! Eat, mingle with attendees, and network with company representatives. Attendees who have attended events earlier in the day receive priority status and will be served first.\n\nJoin us for a delicious dinner from Olive Garden!\n:food:\nhttps://tse1.mm.bing.net/th/id/OIP.rWuMi45Si2kowwIvNC_aVwHaHa | Chicken Parmigiana | Non-Veg, Contains Gluten, Contains Dairy\nhttps://tse4.mm.bing.net/th/id/OIP.XQ7UyDzho1jxFRlDAtjx2AHaI9 | Chicken Alfredo | Non-Veg, Contains Gluten, Contains Dairy\nhttps://upload.wikimedia.org/wikipedia/commons/2/22/2020-03-14_21_40_07_Fettuccine_Alfredo_at_the_Olive_Garden_in_Fair_Lakes%2C_Fairfax_County%2C_Virginia.jpg | Fettuccine Alfredo | Vegetarian, Contains Dairy\nhttps://upload.wikimedia.org/wikipedia/commons/3/31/Spaghetti_al_pomodoro%2C_icona_della_cucina_italiana_nel_mondo._.jpg | Spaghetti Marinara | Vegan\nhttps://upload.wikimedia.org/wikipedia/commons/a/a7/Rotiniwithtomatosauce.jpg | Rotini Pasta with Marinara | Gluten-free, Contains Dairy\n:menu: https://www.olivegarden.com/",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel Second Floor Atrium",
		"isVisible": true,
		"attendanceCount": 154,
		"eventType": "MEALS",
		"tags": []
	},
	{
		"eventId": "aee2bdc2-487a-4697-8119-926746623e7e",
		"name": "Wednesday Dinner Sponsored By Magna",
		"startTime": "2025-09-18T00:30:00+00:00",
		"endTime": "2025-09-18T01:30:00+00:00",
		"points": 0,
		"description": "Join us for free dinner from Shawarma Joint sponsored by Magna! Attendees who have attended an event earlier in the day receive priority status and will be served first.\n\n:food:\nhttps://littlesunnykitchen.com/wp-content/uploads/2025/02/Shawarma-Rice-Recipe-6.jpg | Rice | Vegan, Gluten Free\nhttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfaN1qIA_SOgOiUJBrMNrL_OB-4g4aEXfPZg&s.png | Mixed Salad | \nhttps://instantpot.com/cdn/shop/articles/Aladdins-Eaterys-Hummus-Shawarma-Plate.jpg?v=1707926083 | Hummus | Vegan, may contain gluten\nhttps://kabob-chi.com/wp-content/uploads/2021/03/Chicken-Shawarma-Catering-0366.jpg | Chicken |\nhttps://pbs.twimg.com/media/FpJfA26XEAA1kjC.jpg | Falafel | Contains gluten\nhttps://images.squarespace-cdn.com/content/v1/5ea3b22556f3d073f3d9cae4/dad2004e-ab09-4ccc-a975-c87dd03552b3/B3818A6D-C2B3-455E-ABDB-09B929835C27_1_102_a.jpeg | Pita Bread | Contains gluten",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel Second Floor Atrium",
		"isVisible": true,
		"attendanceCount": 170,
		"eventType": "MEALS",
		"tags": []
	},
	{
		"eventId": "f13ea1f6-f78d-415e-956f-062779b4e0e3",
		"name": "Friday Dinner Sponsored by HRT",
		"startTime": "2025-09-20T00:30:00+00:00",
		"endTime": "2025-09-20T01:30:00+00:00",
		"points": 0,
		"description": "Join us for free dinner sponsored by HRT! Eat, mingle with attendees, and network with company representatives. Attendees who have attended 2 events earlier in the day receive priority status and will be served first.\n\nJoin us for yummy bento boxes from EVO Chinese!\n\n:food:\n| Bento Box: Mapo Tofu + Cabbage & Glass Noodle + White Rice | Vegan, Contains Soy sauce\n\n| Bento Box: Silk Tofu w Salted Egg Yolk + Spicy Garlic Eggplant + White Rice | Vegetarian, Contains Soy sauce, Egg\n\n| Bento Box: Kung Pao Chicken + Tomato Egg Stir-fry + Fried Rice | Contains Chicken, Soy sauce\n\n| Bento Box: Pork Meatball + Bok Choy Stir-fry + Fried Rice | Contains Pork, Soy sauce\n\n| Bento Box: Bean Sprout Stir Fry + Steam Egg + White Rice | Gluten-free\n\n:menu: https://evocafeil.com/order/",
		"isVirtual": false,
		"imageUrl": "https://google.com",
		"location": "Siebel Second Floor Atrium",
		"isVisible": true,
		"attendanceCount": 163,
		"eventType": "MEALS",
		"tags": []
	}
]

export default function Schedule() {
  const toast = useToast();
  const [eventsByDay, setEventsByDay] = useState<{ [key: string]: Event[] }>(
    {}
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [hoveredEventIndex, setHoveredEventIndex] = useState<number | null>(
    null
  );

  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  const selectedDayIndex = Math.max(
    Object.keys(eventsByDay).indexOf(selectedDay || "") + 1,
    1
  );
  const dayEvents = selectedDay ? eventsByDay[selectedDay] : [];

  const handleLoadEvents = useCallback(() => {
    try {
      const grouped: {[key: string]: Event[]} = {}

      EventsData.forEach((evt) => {
        const date = moment(evt.startTime).format("ddd M/D");
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(evt);
      });

      setEventsByDay(grouped);

      const dates = Object.keys(grouped).map((key) => {
        const date = moment(
          key + " " + moment().year(),
          "ddd M/D YYYY"
        ).startOf("day");
        return { key, date };
      })

      dates.sort((a, b) => a.date.valueOf() - b.date.valueOf());

      if(dates.length > 0) {
        const today = moment();
        let selectedKey: string;
        
        if(today.isBefore(dates[0].date)) {
          selectedKey = dates[0].key;
        } else {
          const past = dates.filter((d) => today.isSameOrAfter(d.date));
          selectedKey = past.length ? past[past.length - 1].key : dates[0].key;
        }

        setSelectedDay(selectedKey);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading events",
        status: "error",
        duration: 9000,
        isClosable: true
      });
    }
  }, [toast]);

  useEffect(() => {
    handleLoadEvents();
  }, [handleLoadEvents]);

  const handleHover = (index: number) => setHoveredEventIndex(index);
  const handleSelectDay = (date: string) => {
    setHoveredEventIndex(null);
    setSelectedDay(date);
  };
  const handleSelectEvent = (evt: Event) => setSelectedEvent(evt);

  const updateCurrentAndNext = useCallback(() => {
    const all = Object.values(eventsByDay).flat();
    const sorted = all.sort((a, b) =>
      moment(a.startTime).diff(moment(b.startTime))
    );

    const now = moment();
    const currentEvents: Event[] = [];
    let nxt: Event | null = null;

    for (const evt of sorted) {
      const start = moment(evt.startTime);
      const end = moment(evt.endTime);

      if (start.isSameOrBefore(now) && end.isAfter(now)) {
        currentEvents.push(evt);
        continue;
      }
      if (!nxt && start.isAfter(now)) {
        nxt = evt;
        break;
      }
    }

    setCurrentEvents(currentEvents);
    setNextEvent(nxt);
  }, [eventsByDay]);

  useEffect(() => {
    updateCurrentAndNext();
    const timer = setInterval(() => {
      updateCurrentAndNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [updateCurrentAndNext, eventsByDay]);

  return (
    <>
      <Box
        position="relative"
        w="100%"
        bgColor="#100E0E"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        py={{ base: 5, md: 10 }}
        id="schedule"
      >
        <Image
          src="/site/schedule/schedule-accent.svg"
          position="absolute"
          top={{ base: "-15%", lg: "-50%" }}
          left={{ base: "-25%", lg: "-10%" }}
          opacity={0.5}
          pointerEvents="none"
        />

        <Box position="relative" zIndex={1}>
          <AnimatedHeader zIndex={1}>Schedule</AnimatedHeader>
          <ScheduleDaySelector
            selectedDay={selectedDay}
            eventsByDay={eventsByDay}
            onSelectDay={handleSelectDay}
          />
        </Box>

        <Flex
          w="100%"
          maxWidth="1500px"
          justifyContent="center"
          flexDirection={{ md: "column-reverse", lg: "row" }}
          mt={{ base: 5, md: 5 }}
          mx="auto"
          gap={0}
          px={{ base: 3, md: 10 }}
          position="relative"
          zIndex={1}
        >
          <DayEventsSection
            selectedDayIndex={selectedDayIndex}
            numDays={Object.keys(eventsByDay).length}
            hoveredIndex={hoveredEventIndex}
            dayEvents={dayEvents}
            onHover={handleHover}
            onClick={handleSelectEvent}
          />
          <RaceTrackSection
            dayEvents={dayEvents}
            hoveredEventIndex={hoveredEventIndex}
            selectedDayIndex={selectedDayIndex}
            currentEvents={currentEvents}
            nextEvent={nextEvent}
            handleHover={handleHover}
            handleSelectEvent={handleSelectEvent}
          />
        </Flex>
      </Box>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}

function formatEventTime(iso: string): string {
  const m = moment(iso).tz("America/Chicago");
  const now = moment().tz("America/Chicago");

  if (m.isSame(now, "day")) {
    return m.format("h:mma");
  }
  if (Math.abs(m.diff(now, "days")) <= 7) {
    return m.calendar(null, {
      sameDay: "[Today] h:mma",
      nextDay: "[Tomorrow] h:mma",
      nextWeek: "dddd h:mma",
      lastDay: "[Yesterday] h:mma",
      lastWeek: "[Last] dddd h:mma",
      sameElse: "MMM D, h:mma"
    });
  }
  return m.format("MMM D, h:mma");
}

function formatEventRange(startIso: string, endIso: string): string {
  const start = moment(startIso).tz("America/Chicago");
  const end = moment(endIso).tz("America/Chicago");

  const startLabel = formatEventTime(startIso);

  const endLabel = start.isSame(end, "day")
    ? end.format("h:mma")
    : formatEventTime(endIso);

  return `${startLabel} – ${endLabel} CT`;
}

function DayEventsSection({
  selectedDayIndex,
  numDays,
  hoveredIndex,
  dayEvents,
  onHover,
  onClick
}: {
  selectedDayIndex: number;
  numDays: number;
  hoveredIndex: number | null;
  dayEvents: Event[];
  onHover: (index: number) => void;
  onClick: (event: Event) => void;
}) {
  return (
    <Box flex={1} h="100%" py={0}>
      <HStack
        display={{
          base: "none",
          lg: "flex"
        }}
        alignItems={"center"}
        justifyContent={"center"}
        gap={3}
        bgColor="#4D4C4C"
        borderTopRadius={"xl"}
        mb={3}
        py={2}
        boxShadow="md"
      >
        <Text
          fontSize={"3xl"}
          color="#8A8A8A"
          fontFamily="ProRacingSlant"
          my={0}
        >
          Lap
        </Text>
        <HStack gap={0}>
          <Text
            fontSize={"3xl"}
            fontWeight="bold"
            color="white"
            fontFamily="Magistral"
            my={0}
          >
            {selectedDayIndex}
          </Text>
          <Text fontSize={"3xl"} color="#8A8A8A" fontFamily="Magistral" my={0}>
            /{numDays}
          </Text>
        </HStack>
      </HStack>
      <Box
        bgColor={{ md: "#242424" }}
        pb={5}
        borderTopRadius={{
          base: "xl",
          lg: "none"
        }}
        borderBottomRadius="xl"
        overflowY={{ md: "auto" }}
        shadow={"md"}
        boxShadow="md"
      >
        <Box h={{ lg: "500px" }} maxH={{ lg: "500px" }} pt={3} overflowY="auto">
          {dayEvents.length === 0 && (
            <Text
              fontSize="xl"
              color="gray.500"
              fontFamily="Racing Sans One"
              textAlign="center"
            >
              No events scheduled yet.
            </Text>
          )}
          {dayEvents.map((event, index) => (
            <DayEvent
              key={index}
              number={index + 1}
              hoveredIndex={hoveredIndex}
              event={event}
              onHover={onHover}
              onClick={onClick}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function RaceTrackSection({
  selectedDayIndex,
  dayEvents,
  hoveredEventIndex,
  handleHover,
  handleSelectEvent,
  currentEvents,
  nextEvent
}: {
  selectedDayIndex: number;
  dayEvents: Event[];
  hoveredEventIndex: number | null;
  currentEvents: Event[];
  nextEvent: Event | null;
  handleHover: (index: number) => void;
  handleSelectEvent: (event: Event) => void;
}) {
  return (
    <Flex
      display={{
        base: "none",
        md: "flex"
      }}
      flex={1}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Box
        display="flex"
        flexDir={"column"}
        flex={1}
        borderRadius="lg"
        h="100%"
      >
        <Spacer flex={1} />
        <Box
          w="100%"
          transform={{
            base: "scale(0.9)",
            md: "scale(0.7)",
            lg: "scale(0.8)"
          }}
          flexDirection={"column"}
          justifyContent={"center"}
          mt={{
            base: -16,
            lg: 0
          }}
          mb={{
            base: 16,
            md: 0
          }}
        >
          <RaceTrack
            dayEvents={dayEvents}
            colors={circleColors}
            hoveredIndex={hoveredEventIndex}
            onHover={handleHover}
            onClick={handleSelectEvent}
            selectedDayIndex={selectedDayIndex}
          />
        </Box>
        <Spacer flex={1} />
        <Box
          display={{ base: "none", lg: "flex" }}
          flexDir="column"
          bgGradient="linear(to-b, #454242 0%, #272727 100%)"
          px={4}
          py={2}
          pb={5}
          ml={4}
          borderRadius={"xl"}
          alignItems={"flex-start"}
          shadow={"md"}
        >
          <Flex
            alignItems={"center"}
            mb={2}
            w="100%"
            gap={7}
            borderBottom="2px solid"
            borderBottomColor="orange.300"
          >
            <Text
              fontSize="2xl"
              color="white"
              fontFamily="ProRacingSlant"
              my={0}
            >
              R|P Radio
            </Text>
            <AudioVisualizer />
          </Flex>
          <Flex
            w="100%"
            gap={2}
            flexDir={{
              base: "column",
              md: "row"
            }}
          >
            {currentEvents.length === 0 && !nextEvent && (
              <Text color="white" fontFamily="Magistral">
                No ongoing events.
              </Text>
            )}
            {currentEvents.length > 0 && (
              <>
                {currentEvents.length > 0 &&
                  currentEvents.map((event, index) => (
                    <Box flex={1}>
                      <PreviewEvent
                        label="Current"
                        event={event}
                        showLabel={index === 0}
                        onClick={() => {
                          handleSelectEvent(event);
                        }}
                      />
                    </Box>
                  ))}
              </>
            )}
            {nextEvent && (
              <Box
                flex={1}
                gap={2}
                display="flex"
                flexDir={"column"}
                justifyContent={"space-between"}
              >
                <PreviewEvent
                  showLabel
                  label="Next Up"
                  event={nextEvent}
                  onClick={() => {
                    handleSelectEvent(nextEvent);
                  }}
                />
              </Box>
            )}
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}

function PreviewEvent({
  label,
  event,
  showLabel,
  compact,
  onClick
}: {
  label: string;
  event: Event;
  showLabel?: boolean;
  compact?: boolean;
  onClick: (event: Event) => void;
}) {
  return (
    <Box w="100%" display="flex" flexDirection={"column"} gap={1}>
      <Box h={5} pb={2}>
        {showLabel && (
          <Text color="white" fontFamily="Magistral" fontSize={"md"}>
            {label}
          </Text>
        )}
      </Box>
      <Flex
        alignItems={"center"}
        bgColor={"#1e1e1eff"}
        borderRadius={"lg"}
        p={2}
        onClick={() => {
          onClick(event);
        }}
        transition="all 0.2s ease-in-out"
        _hover={{
          bgColor: "rgba(72, 72, 72, 1)",
          cursor: "pointer"
        }}
      >
        <Flex direction="column" flex={1} w="100%" gap={0}>
          <Flex alignItems={"center"} gap={2}>
            <Box
              w={compact ? "10px" : "10px"}
              h={compact ? "10px" : "10px"}
              minW="10px"
              minH="10px"
              bg={label === "Current" ? "green.500" : "red.500"}
              borderRadius="full"
            />
            <Text
              fontSize={compact ? "md" : "sm"}
              color="white"
              fontFamily="ProRacing"
            >
              {event.name}
            </Text>
          </Flex>
          {!compact ? (
            <Flex direction="column" gap={0}>
              <Text
                fontSize={{ base: "md", md: "sm" }}
                color="gray.100"
                fontWeight="bold"
                fontFamily="Magistral"
                letterSpacing="0.5px"
                transformOrigin={"top left"}
                wordBreak="break-all"
                whiteSpace="normal"
                mr={3}
              >
                {event.location || "Siebel CS"}
              </Text>

              <Text
                fontSize={{ base: "md", md: "sm" }}
                color="gray.400"
                fontWeight="bold"
                fontFamily="Magistral"
                letterSpacing="0.5px"
                transformOrigin={"top left"}
                whiteSpace={{
                  md: "nowrap"
                }}
              >
                {formatEventRange(event.startTime, event.endTime)}
              </Text>
            </Flex>
          ) : (
            <></>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
