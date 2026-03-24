$ErrorActionPreference = "Stop"

$templatePath = "C:\Users\Mohankumar\Downloads\AI virtual Keyboard V2.docx"
$outputPath = "D:\TCG TECHNOLOGY CLIENTS\ERP\AI_Virtual_Keyboard_Full_Report.docx"

if (-not (Test-Path -LiteralPath $templatePath)) {
    throw "Template DOCX not found: $templatePath"
}

function Escape-Xml {
    param([string]$Text)
    if ($null -eq $Text) { return "" }
    return [System.Security.SecurityElement]::Escape($Text)
}

function New-RunXml {
    param(
        [string]$Text,
        [switch]$PreserveSpace
    )

    $escaped = Escape-Xml $Text
    $spaceAttr = ""
    if ($PreserveSpace -or $Text -match "^\s|\s$|\s{2,}") {
        $spaceAttr = ' xml:space="preserve"'
    }
    return "<w:r><w:t$spaceAttr>$escaped</w:t></w:r>"
}

function New-ParagraphXml {
    param(
        [string]$Text,
        [string]$Style = "",
        [switch]$Center,
        [switch]$PageBreakBefore,
        [switch]$KeepWithNext
    )

    $pPr = @()
    if ($Style) { $pPr += "<w:pStyle w:val=""$Style""/>" }
    if ($Center) { $pPr += "<w:jc w:val=""center""/>" }
    if ($PageBreakBefore) { $pPr += "<w:pageBreakBefore/>" }
    if ($KeepWithNext) { $pPr += "<w:keepNext/>" }

    $pPrXml = ""
    if ($pPr.Count -gt 0) {
        $pPrXml = "<w:pPr>$($pPr -join '')</w:pPr>"
    }

    return "<w:p>$pPrXml$(New-RunXml -Text $Text -PreserveSpace)</w:p>"
}

function New-CodeParagraphXml {
    param([string]$Text)
    return "<w:p><w:r><w:rPr><w:rFonts w:ascii=""Consolas"" w:hAnsi=""Consolas""/><w:sz w:val=""20""/></w:rPr><w:t xml:space=""preserve"">$(Escape-Xml $Text)</w:t></w:r></w:p>"
}

function New-PageBreakXml {
    return "<w:p><w:r><w:br w:type=""page""/></w:r></w:p>"
}

function Add-Paragraphs {
    param(
        [System.Collections.Generic.List[string]]$Doc,
        [string[]]$Paragraphs
    )

    foreach ($paragraph in $Paragraphs) {
        $Doc.Add((New-ParagraphXml -Text $paragraph))
    }
}

function Expand-TopicParagraphs {
    param(
        [string]$Topic,
        [string]$Context,
        [string]$Risk,
        [string]$Benefit
    )

    return @(
        "$Topic is a relevant area of study for the AI Virtual Keyboard because $Context. In a conventional environment this activity is invisible to the user, yet it strongly influences accuracy, comfort, and trust. The project treats $Topic as a design concern instead of leaving it as an accidental side effect of implementation.",
        "During analysis, the team observed that weaknesses in $Topic usually appear only after prolonged use. Users can tolerate a prototype for a few minutes, but they quickly notice friction when the same action is repeated hundreds of times. That is why the report evaluates $Topic using practical classroom, office, and demonstration scenarios rather than limiting the discussion to theoretical behaviour.",
        "The project approach reduces the risk of $Risk by combining computer vision, event validation, and voice guidance. This combination converts a fragile interaction model into a dependable one. The resulting benefit is $Benefit, which directly supports the broader objective of replacing or supplementing a physical keyboard in real-world settings."
    )
}

$tmpRoot = Join-Path $env:TEMP ("ai_vk_report_" + [guid]::NewGuid().ToString())
$zipPath = Join-Path $tmpRoot "template.zip"
$unzipPath = Join-Path $tmpRoot "unzipped"
New-Item -ItemType Directory -Path $tmpRoot | Out-Null
Copy-Item -LiteralPath $templatePath -Destination $zipPath
Expand-Archive -LiteralPath $zipPath -DestinationPath $unzipPath -Force

[xml]$templateXml = Get-Content -LiteralPath (Join-Path $unzipPath "word\document.xml")
$ns = New-Object System.Xml.XmlNamespaceManager($templateXml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$sectPrNode = $templateXml.SelectSingleNode("//w:sectPr", $ns)
$sectPrXml = if ($sectPrNode) { $sectPrNode.OuterXml } else { '<w:sectPr/>' }

$doc = New-Object 'System.Collections.Generic.List[string]'

$doc.Add((New-ParagraphXml -Text "PROJECT REPORT" -Style "Title" -Center))
$doc.Add((New-ParagraphXml -Text "AI VIRTUAL KEYBOARD" -Style "Title" -Center))
$doc.Add((New-ParagraphXml -Text "Comprehensive Documentation Based on the Submitted Project Theme" -Style "Subtitle" -Center))
$doc.Add((New-ParagraphXml -Text "Prepared for academic project submission" -Center))
$doc.Add((New-ParagraphXml -Text "Date: 23 March 2026" -Center))
$doc.Add((New-PageBreakXml))

$doc.Add((New-ParagraphXml -Text "TABLE OF CONTENTS" -Style "Heading1"))
$tocLines = @(
    "1. INTRODUCTION",
    "1.1 Overview of the Project",
    "2. SYSTEM STUDY AND ANALYSIS",
    "2.1 Existing System",
    "2.1.1 Drawbacks of the Existing System",
    "2.2 Proposed System",
    "2.2.1 Advantages of the Proposed System",
    "3. SYSTEM SPECIFICATION",
    "3.1 Hardware Specification",
    "3.2 Software Specification",
    "3.3 Language Specification",
    "4. SYSTEM DESIGN AND DEVELOPMENT",
    "4.1 System Design",
    "4.1.1 Input Design",
    "4.1.2 Output Design",
    "4.1.3 Database Design",
    "4.1.4 Code Design",
    "4.1.5 Data Flow Diagram",
    "4.2 System Development",
    "4.2.1 Module Description",
    "5. SYSTEM TESTING AND IMPLEMENTATION",
    "5.1 System Testing",
    "5.2 System Implementation",
    "5.2.1 Implementation Procedures",
    "6. CONCLUSION",
    "7. SUGGESTION FOR FUTURE ENHANCEMENT",
    "BIBLIOGRAPHY",
    "APPENDIX",
    "A.1 Screen Shots",
    "A.2 Sample Coding"
)
Add-Paragraphs -Doc $doc -Paragraphs $tocLines
$doc.Add((New-PageBreakXml))

$doc.Add((New-ParagraphXml -Text "ABSTRACT" -Style "Heading1"))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The AI Virtual Keyboard project proposes a touchless human computer interaction platform that allows a user to type using mid-air hand gestures captured by a standard web camera. The system reduces dependency on mechanical keys, introduces a safer interaction model for public environments, and demonstrates how low-cost artificial intelligence techniques can be transformed into an assistive product.",
    "The solution combines hand landmark detection, gesture interpretation, virtual key rendering, text composition, speech assistance, and self-learning vocabulary support. Instead of requiring a user to physically press a button, the software monitors the motion of the index finger and validates a key press using geometric depth movement. This design choice gives the interface a more natural feel while reducing accidental selections.",
    "Another major contribution of the system is the integration of an AI assistant named Luna. The assistant provides speech output, handles command-based editing, and supports voice typing when gesture entry is inconvenient. The hybrid model of gesture plus voice creates a more inclusive interface for users with different abilities, environments, and work styles.",
    "This documentation expands the original project report into a detailed academic record. It explains the motivation for the work, surveys the weaknesses of conventional approaches, documents the hardware and software stack, describes the internal design and implementation, and presents testing, deployment, limitations, and future opportunities. The report is intended to serve both as a project submission and as a technical reference for future enhancement."
)

$doc.Add((New-ParagraphXml -Text "1 INTRODUCTION" -Style "Heading1" -PageBreakBefore))
$doc.Add((New-ParagraphXml -Text "1.1 Overview of the Project" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "Human computer interaction has evolved from command-line interfaces to graphical interfaces, touch surfaces, wearables, and immersive spatial systems. Throughout that evolution, the keyboard has remained the most productive text entry device, yet it still depends on physical contact, fixed hardware, and a specific posture. The AI Virtual Keyboard project addresses these limitations by translating hand motion into typed text without requiring a dedicated keyboard surface.",
    "The proposed system uses a webcam to identify the hand and track finger landmarks in real time. A virtual keyboard is rendered on the video stream, and the position of the index finger is mapped to the displayed keys. When the finger performs a validated press gesture, the corresponding character is appended to the text buffer and can also be sent to another application. The end result is a software-defined keyboard that can be used in classrooms, labs, kiosks, hospitals, demonstrations, and assistive computing environments.",
    "The project is important because it sits at the intersection of computer vision, user interface design, accessibility engineering, and applied artificial intelligence. Rather than treating AI as a buzzword, the system uses specific machine-assisted functions where they add measurable value: hand tracking for spatial awareness, speech processing for multimodal control, and a self-learning dictionary for personalization. Each of these features contributes directly to usability.",
    "From an academic perspective, the AI Virtual Keyboard is also a strong case study in multidisciplinary system design. It includes live camera input, frame-wise processing, event-driven state management, voice processing in background threads, persistent storage for learned data, and practical considerations such as latency, false-positive control, and user feedback. These characteristics make the project suitable for documentation under software engineering, AI application development, and embedded interaction design.",
    "The motivation behind the project can be framed around four everyday realities. First, users increasingly expect contactless interaction in shared spaces. Second, not all devices can accommodate a full physical keyboard, especially in augmented or compact environments. Third, some users find conventional key travel uncomfortable or inaccessible. Fourth, educational projects increasingly require AI-backed systems that solve a visible problem. The AI Virtual Keyboard responds meaningfully to all four drivers.",
    "The scope of the project includes the capture of visual input through a webcam, hand landmark extraction using a pre-trained detection model, virtual layout generation, gesture-to-key mapping, voice assistance, word prediction, and persistent vocabulary learning. The current implementation is focused on English alphanumeric entry, but the underlying design is intentionally modular so that new layouts, commands, and models can be added later.",
    "The remainder of this report follows the structure requested in the table of contents. It first studies the existing system and its weaknesses, then explains the proposed solution and its advantages. It proceeds through specification, design, implementation, testing, and future enhancement. Appendix material is included to support demonstration and evaluation."
)

$doc.Add((New-ParagraphXml -Text "2 SYSTEM STUDY AND ANALYSIS" -Style "Heading1" -PageBreakBefore))
$doc.Add((New-ParagraphXml -Text "2.1 Existing System" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The existing system for text input in most computing environments is still dominated by the physical keyboard. Desktop systems, laptops, industrial consoles, and public terminals rely on a mechanical arrangement of keys that must be pressed with a certain amount of force. The design is mature, highly optimized, and familiar; however, its strengths are also tied to the assumption that the user can physically access the hardware and that the hardware is available in the first place.",
    "In mobile devices, the most common alternative is the software keyboard on a touch screen. This eliminates moving parts and allows layout flexibility, but it still depends on surface contact. Touch keyboards also reduce tactile feedback, consume screen space, and can become difficult to operate accurately when the user is moving, wearing gloves, or trying to maintain hygiene in a shared environment.",
    "A third category includes conventional virtual keyboard systems driven by a mouse, trackpad, or dwell-based gesture logic. These systems display a keyboard on screen and expect the user to hover over a key for a predefined delay. Although they reduce the need for physical key travel, they are often slow, fatiguing, and prone to accidental activation when hand tracking is unstable.",
    "Speech-only input systems represent another existing alternative. Voice typing works well in quiet conditions and for continuous text, but it becomes unreliable in noisy spaces, socially awkward in public settings, and unsuitable when users need precise symbolic entry such as passwords, commands, punctuation, or mixed-language terms. Privacy is also a concern in many real environments.",
    "Assistive input technologies such as eye-tracking keyboards, switch access systems, and head-controlled interfaces offer valuable support for users with disabilities. However, they are frequently expensive, specialized, or dependent on dedicated hardware. Their availability is limited in ordinary classrooms and small project environments. This creates a gap for low-cost, camera-based interaction systems that can run on common consumer hardware.",
    "The study of the existing system therefore shows that traditional input methods are effective in stable and conventional settings, but they become less satisfactory when flexibility, touchless interaction, affordability, and multimodal control are required at the same time. That gap is the problem space in which the proposed AI Virtual Keyboard is positioned."
)

$doc.Add((New-ParagraphXml -Text "2.1.1 Drawbacks of the Existing System" -Style "Heading2" -KeepWithNext))
$drawbackTopics = @(
    @{ Topic = "Hygiene"; Context = "public devices are touched by many users in succession"; Risk = "surface-borne contamination and user discomfort"; Benefit = "a safer and more acceptable interaction model for kiosks, hospitals, and shared workstations" },
    @{ Topic = "Accessibility"; Context = "some users cannot comfortably apply repeated force on small keys or maintain conventional typing posture"; Risk = "fatigue, exclusion, and reduced typing speed"; Benefit = "a more inclusive interface that can be adapted to the user instead of forcing the user to adapt to the hardware" },
    @{ Topic = "Hardware Dependency"; Context = "physical keyboards can fail, disconnect, or become impractical in compact and projected environments"; Risk = "loss of productivity when a dedicated keyboard is unavailable"; Benefit = "greater portability and continuity because the interaction surface is generated in software" },
    @{ Topic = "Layout Inflexibility"; Context = "fixed keyboards do not change form based on user role, language, or context without replacing hardware"; Risk = "poor adaptability and inefficient customization"; Benefit = "on-demand layouts optimized for the task, language, or application workflow" },
    @{ Topic = "Maintenance Cost"; Context = "mechanical components degrade over time and require cleaning, replacement, or repair"; Risk = "downtime and recurring operational expense"; Benefit = "lower maintenance overhead by shifting complexity from hardware to software" }
)
foreach ($item in $drawbackTopics) {
    Add-Paragraphs -Doc $doc -Paragraphs (Expand-TopicParagraphs -Topic $item.Topic -Context $item.Context -Risk $item.Risk -Benefit $item.Benefit)
}

$doc.Add((New-ParagraphXml -Text "2.2 Proposed System" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The proposed system is a webcam-based AI Virtual Keyboard that converts hand gestures into text input without relying on mechanical keys. The software displays a virtual QWERTY layout, continuously tracks the user’s hand, identifies the active fingertip, and validates an intentional tapping motion using depth change. Once a key press is confirmed, the selected character is appended to a text buffer and can also be emitted as a system key event.",
    "The solution is intentionally multimodal. In addition to gesture typing, the user can issue voice commands and receive auditory feedback from the assistant module. This improves usability in situations where typing every control action through gestures would be inefficient. For example, a user can clear text through a command, ask for confirmation, or dictate words that are difficult to enter letter by letter.",
    "The intelligence of the proposed system lies not in a single monolithic AI model but in the coordinated use of several targeted capabilities. MediaPipe-based landmark estimation provides real-time hand understanding, rule-based event logic transforms movement into click semantics, and the self-learning dictionary extends the vocabulary based on user-confirmed additions. This layered approach keeps the system understandable, modular, and suitable for academic analysis.",
    "From an implementation standpoint, the proposed system uses low-cost and widely available hardware. A standard webcam and microphone are sufficient to operate the current version. This is a crucial design objective because project success should not depend on expensive sensors or commercial SDK licenses. The software stack therefore favours open frameworks, reproducible logic, and straightforward deployment.",
    "The architecture of the proposed system consists of an input layer, a processing layer, a control layer, and an output layer. The input layer handles video and audio capture. The processing layer performs hand tracking, gesture validation, speech recognition, and text handling. The control layer manages state transitions, cooldown timers, and command routing. The output layer renders the keyboard, displays typed text, speaks responses, and writes learned words into persistent storage.",
    "Overall, the proposed system is designed as a practical contactless input solution rather than a laboratory demonstration. It focuses on usability, low latency, safety against accidental presses, and long-term extensibility. These characteristics make it a credible foundation for future research and product-level refinement."
)

$doc.Add((New-ParagraphXml -Text "2.2.1 Advantages of the Proposed System" -Style "Heading2" -KeepWithNext))
$advantageAreas = @(
    "The first major advantage of the proposed system is touchless interaction. Because typing occurs through camera-detected gestures, the interface can be used in shared environments without requiring repeated contact with a common surface. This is especially valuable in healthcare reception areas, self-service machines, and educational demonstration labs where cleanliness and perceived safety influence adoption.",
    "A second advantage is flexibility. Since the keyboard exists in software, its size, arrangement, visual theme, and command set can be changed without replacing hardware. This opens the door to multilingual layouts, domain-specific hotkeys, reduced-key accessible layouts, or adaptive interfaces that reorganize themselves around user behaviour.",
    "A third advantage is accessibility. Users who cannot comfortably press conventional keys may still be able to point, hover, and perform a shallow tap motion in the air. Combined with voice support, the system offers multiple paths to the same outcome. This multimodal design lowers the barrier for users with diverse physical abilities and situational limitations.",
    "The proposed system also improves engagement and educational value. Because the keyboard is visual, animated, and responsive to gestures, it demonstrates artificial intelligence concepts in a tangible way. Students and reviewers can directly observe how landmark detection, event logic, threading, and language support work together. This makes the project suitable not only as a utility but also as a teaching tool.",
    "Another advantage is cost-effectiveness. The project avoids dedicated depth cameras, proprietary motion controllers, and specialized custom hardware. By relying on a webcam and an ordinary personal computer, the barrier to experimentation is kept low. This encourages replication, incremental improvement, and deployment in smaller institutions.",
    "The final strategic advantage is extensibility. The current implementation already combines typing, speech output, commands, and dictionary learning. The same architecture can support predictive suggestions, authentication gestures, sign language integration, cloud synchronization, multilingual speech models, or AR overlays. In other words, the project is not a dead-end prototype; it is an expandable platform."
)
Add-Paragraphs -Doc $doc -Paragraphs $advantageAreas

$doc.Add((New-ParagraphXml -Text "3 SYSTEM SPECIFICATION" -Style "Heading1" -PageBreakBefore))
$doc.Add((New-ParagraphXml -Text "3.1 Hardware Specification" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The hardware requirement for the AI Virtual Keyboard is intentionally modest so that the system remains practical for student projects and low-cost deployments. A computer with at least an Intel i3 or equivalent processor, 4 GB RAM, and integrated graphics is sufficient for baseline operation. Better processors improve frame processing consistency, especially when voice recognition and rendering run simultaneously.",
    "A standard HD webcam acts as the primary visual sensor. The camera should ideally support 720p capture at a stable frame rate because hand landmark detection depends on clear fingertip visibility. Even though the underlying hand-tracking model can function at lower resolutions, higher frame clarity reduces jitter and improves the reliability of click validation.",
    "A microphone is required for voice commands, voice typing, and confirmation prompts used by the assistant module. In a quiet environment, a built-in laptop microphone is usually enough. In noisy environments, an external microphone or headset improves recognition accuracy and reduces the number of retries needed for command interpretation.",
    "A monitor with standard Full HD resolution is preferred because the virtual keyboard and output text need enough screen area to remain readable while the camera feed is visible. The project can still run on smaller displays, but key sizes and layout spacing may need to be adjusted so that gesture targeting remains comfortable.",
    "Input lighting should be considered part of the operational hardware environment. Consistent front lighting or ambient room lighting significantly improves landmark extraction. Backlit scenes, reflective surfaces, and extreme shadows can reduce model confidence, which indirectly affects the hardware performance perceived by the user.",
    "The baseline hardware profile can therefore be summarized as: processor equal to or above Intel i3, 4 GB RAM or more, webcam, microphone, display, and normal indoor lighting. This simple requirement set is one of the project's strongest practical advantages."
)

$doc.Add((New-ParagraphXml -Text "3.2 Software Specification" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The project is designed for a Windows environment because the assistant module uses the Windows speech API through Win32com for low-latency text-to-speech. The operating system requirement may be stated as Windows 10 or above for the primary documented version, though substantial parts of the vision logic are portable to other platforms with minor adaptations.",
    "Python forms the execution environment for the original project logic. Required libraries include OpenCV for image processing, cvzone for simplified hand-tracking utilities, MediaPipe for landmark detection, pynput for keyboard event generation, SpeechRecognition for speech-to-text, and Win32com for text-to-speech integration. Threading and queue modules from the standard library coordinate asynchronous behaviour.",
    "The system should be executed in a Python environment with the necessary dependencies installed and with camera and microphone permissions available to the application. Stable package versions are recommended because computer vision APIs and speech libraries sometimes introduce breaking changes across releases. For academic deployment, freezing the tested versions is advisable.",
    "A local text file, such as model.txt, is used as a lightweight persistence layer for learned vocabulary. This avoids the overhead of a database server and aligns with the project requirement for a simple, reproducible setup. The software reads this file during startup and appends new confirmed words during runtime.",
    "Any text editor or external target application can receive typed output if the project is configured to emit keystrokes through the operating system. This makes the software useful beyond its own display window. In demonstrations, users can open Notepad or a browser search field and observe that the virtual typing affects the active application in real time.",
    "The software specification therefore prioritizes compatibility, low installation complexity, and easy demonstration. Each component serves a defined purpose, and the stack is broad enough to illustrate modern AI-assisted interaction without becoming unnecessarily heavy."
)

$doc.Add((New-ParagraphXml -Text "3.3 Language Specification" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "Python is the principal programming language used in the original implementation of the AI Virtual Keyboard. It was selected because of its readability, large ecosystem, and strong support for machine learning, computer vision, and rapid experimentation. For an academic project, Python also makes the code easier to explain, maintain, and extend.",
    "The language is especially suitable for frame-by-frame image processing workflows where concise syntax helps the developer focus on logic rather than boilerplate. The project uses Python to define button objects, process landmark coordinates, maintain typing state, handle cooldown timers, execute voice operations, and save learned words.",
    "Another reason for choosing Python is the quality of its third-party ecosystem. Instead of building computer vision primitives from scratch, the project can import stable packages and compose them into a solution. This reduces development time while still allowing the student to demonstrate engineering judgement in system integration, threshold tuning, and user experience decisions.",
    "Python also supports multithreading and inter-thread communication through standard modules such as threading and queue. This capability is important because the project needs to keep the video loop responsive while speech services run concurrently. Although Python threads have known limitations under CPU-heavy workloads, the project's mix of I/O and model calls makes the language appropriate for the current scale.",
    "In summary, the choice of Python aligns with the project goals of rapid development, accessible code, library availability, and educational clarity. It enables the project to focus on the intelligent behaviour of the system rather than on low-level memory management or device driver complexity."
)

$doc.Add((New-ParagraphXml -Text "4 SYSTEM DESIGN AND DEVELOPMENT" -Style "Heading1" -PageBreakBefore))
$doc.Add((New-ParagraphXml -Text "4.1 System Design" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "System design defines how the AI Virtual Keyboard transforms raw video and audio input into a reliable text-entry experience. The design objective is not merely to detect a hand but to create a coherent interaction pipeline in which every stage contributes to usability. As a result, the system is structured around visibility, validation, and feedback.",
    "At a high level, the design begins with camera capture and optional microphone input. The camera frame is mirrored so that user movement feels natural. Hand landmarks are then extracted from the frame. The fingertip coordinates are checked against a set of virtual button boundaries. A separate logic layer determines whether the observed motion qualifies as an intentional press. Once a press is accepted, the text buffer and UI are updated, and the assistant may respond with sound or state changes.",
    "The design follows modular decomposition. Vision processing, UI rendering, gesture validation, prediction, voice handling, and persistence are treated as distinct concerns even when they execute inside the same application. This separation reduces complexity and makes the code easier to test and improve.",
    "Another design principle is graceful degradation. If voice recognition is unavailable, the gesture keyboard can still operate. If prediction yields no useful suggestion, text entry continues without interruption. If the system detects unstable input, cooldown and confirmation logic limit the effect of jitter. This resilience is essential for a real-time interactive system.",
    "The design also emphasizes immediate feedback. Users need to know where the system thinks their finger is, which key is currently active, whether a press has been registered, and what text has been produced so far. Visual highlighting, text rendering, and audio confirmations therefore play a direct role in reducing uncertainty and improving confidence."
)

$doc.Add((New-ParagraphXml -Text "4.1.1 Input Design" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "Input design in the AI Virtual Keyboard covers both visual and auditory channels. The main input is the live video stream captured through a webcam. Each frame is processed to detect one or more hands, but the primary interaction generally focuses on the dominant hand or the most confidently detected hand. The input design must therefore support continuous tracking, small positional adjustments, and intentional depth-based tapping.",
    "The choice of fingertip as the primary pointing element is deliberate. The index fingertip is easy for the user to understand, visually prominent in hand-tracking models, and naturally associated with pointing behaviour. Using this landmark reduces the learning curve compared with more complex gesture vocabularies.",
    "The frame is typically mirrored horizontally before display. This design choice allows the user to move left and right as if interacting with a mirror, which feels more intuitive than seeing reversed motion. Although mirroring seems minor, it significantly improves user comfort and lowers adaptation time.",
    "Audio input is used for voice typing, system commands, and confirmation responses. The input design must distinguish between free-form speech intended as text and command phrases intended as control instructions. This distinction is handled through keyword parsing and mode-aware processing so that voice input remains useful rather than disruptive.",
    "Robust input design also requires managing imperfect conditions. Lighting changes, microphone noise, background movement, and partial occlusion can all degrade recognition quality. The system therefore uses thresholding, confidence-based detection, and constrained command sets to keep input manageable in ordinary environments."
)

$doc.Add((New-ParagraphXml -Text "4.1.2 Output Design" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "Output design addresses how the system communicates state, feedback, and results to the user. The primary visual output is the virtual keyboard itself, displayed over the camera feed. Each key must be large enough for gesture targeting, clearly labeled, and consistently positioned so that users can develop muscle memory over time.",
    "A second visual output region displays the final typed text. This region acts as immediate confirmation that the system has interpreted the gesture correctly. Without this visible text buffer, the user would struggle to detect insertion errors, missed clicks, or unwanted duplicates.",
    "The output design also includes dynamic highlighting. When the fingertip hovers over a key, that key can be visually emphasized so that the user sees the current target before clicking. When a click is accepted, the color or outline can change again to indicate successful registration. Such transient feedback reduces uncertainty and shortens the learning curve.",
    "Audio output is produced by the Luna assistant. Spoken feedback is especially useful when the user cannot constantly watch the screen, when a command has changed system mode, or when the software asks permission to learn a new word. The use of speech output turns the keyboard from a silent utility into a conversational interface.",
    "A good output design balances clarity and overload. If the interface speaks too often or flashes too aggressively, it becomes tiring. If it remains too quiet, users lose confidence. The current project aims for informative feedback with restrained visual complexity, which is appropriate for a real-time educational application."
)

$doc.Add((New-ParagraphXml -Text "4.1.3 Database Design" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "Although the project does not require a full relational database, it still includes a meaningful data design for persistence. The central persistent data object is the self-learning vocabulary store, which records user-approved words so that prediction can improve over time. In the documented implementation, this store is represented by a plain text file with one learned token per line.",
    "The decision to use a file-based design is justified by scope and simplicity. The volume of data is small, transactional complexity is minimal, and the priority is easy portability. A plain text store can be inspected manually, backed up without special tools, and shipped with the application. This makes it a suitable choice for an academic prototype.",
    "Conceptually, the data design includes three logical entities: built-in prediction words, learned user words, and runtime text state. Built-in words provide a default vocabulary, learned user words extend that vocabulary across sessions, and runtime text state tracks the current composition buffer and command history during execution.",
    "If the project were upgraded in the future, the database layer could evolve into a lightweight structured format such as SQLite or JSON-based profiles. That would allow per-user dictionaries, timestamps, usage frequency counts, multilingual vocabularies, and conflict-safe updates. The current design keeps those possibilities open without introducing unnecessary complexity now.",
    "Thus, the database design is intentionally small but still architecturally important. It demonstrates persistence, personalization, and state continuity while remaining consistent with the goals of a low-cost and reproducible system."
)

$doc.Add((New-ParagraphXml -Text "4.1.4 Code Design" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "Code design in this project follows procedural flow supported by modular helper components. A button class represents each virtual key with properties such as label, position, and size. Core loops process incoming frames, invoke the hand detector, compute hover and press conditions, update text, and redraw the interface.",
    "State management is crucial in the code design because gesture input is inherently continuous, whereas a key press is a discrete event. The software therefore keeps track of previous depth values, active hover targets, cooldown timers, and whether a press motion is currently in progress. This prevents the same physical movement from generating repeated characters.",
    "The voice assistant operates alongside the video loop using background threads and queues. This is an important code design decision because speech recognition and text-to-speech are blocking operations. If they were executed directly inside the main loop, the camera display would freeze and the user experience would collapse.",
    "The code is also designed around extensibility. The keyboard layout is generated from arrays, making it possible to change rows or add special keys without rewriting the interaction model. Prediction logic is separated enough that more advanced ranking or language models can replace the current first-match approach later.",
    "Error tolerance is incorporated through defensive checks. The program validates that landmarks are available before dereferencing coordinates, that files exist before loading them, and that recognized commands are confirmed before executing sensitive operations such as clearing text. These practices improve reliability without obscuring the logic."
)

$doc.Add((New-ParagraphXml -Text "4.1.5 Data Flow Diagram" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The data flow of the AI Virtual Keyboard can be described as a staged transformation pipeline. Raw video and audio are collected from external devices, processed into machine-understandable signals, validated through application logic, and then translated into visible text, control actions, or spoken responses.",
    "At the first stage, the camera supplies image frames and the microphone supplies audio samples. These are the external input entities. The next stage consists of the processing functions: hand landmark detection, voice recognition, gesture analysis, and command parsing. Each of these processes produces intermediate data such as fingertip coordinates, recognized text, active key identifiers, or confirmed commands.",
    "The logic stage then combines these intermediate results with stored state, including cooldown timers, the current text buffer, and the learned-word store. Based on these combined inputs, the system decides whether to append characters, trigger commands, speak a response, or update prediction output.",
    "Finally, the output stage presents the updated UI, writes data to the model file when needed, and optionally sends keyboard events to the operating system. From a DFD perspective, the important feature is that the system loops continuously: output and user reaction influence the next round of input. This feedback cycle is what makes the interface interactive rather than batch-oriented.",
    "In an academic diagram, the DFD can therefore be summarized with the following major nodes: User, Webcam, Microphone, Vision Engine, Voice Engine, Control Logic, Prediction Store, Virtual Keyboard UI, and External Application. Each node has clear data relationships that are consistent with the implementation."
)

$doc.Add((New-ParagraphXml -Text "4.2 System Development" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "System development for the AI Virtual Keyboard followed an incremental pattern. The earliest milestone was simple hand detection on a live webcam frame. Once detection was stable, the project advanced to virtual key rendering, fingertip hover mapping, and click validation. Only after gesture entry was functional were voice assistance and self-learning vocabulary integrated.",
    "This sequence reflects sound engineering practice. Core interaction had to be proven before auxiliary features were added. If voice features had been introduced too early, debugging would have become more difficult because multiple moving parts would fail at the same time. Building from the visual core outward reduced complexity and made performance bottlenecks easier to isolate.",
    "The development process also involved calibration. Thresholds for depth movement, cooldown timing, and hit-box dimensions could not be fixed purely from theory. They were adjusted based on repeated trial sessions to balance sensitivity with stability. This iterative tuning is typical for human-interface projects where perceived comfort matters as much as mathematical correctness.",
    "Testing occurred continuously during development. Each new module was validated in isolation and then in combination with the rest of the system. For example, the team had to confirm that the voice assistant could speak without interrupting the live camera feed and that learned words persisted correctly after restarting the application.",
    "By the end of development, the system had evolved from a concept into a coherent prototype with gesture typing, prediction, voice commands, and persistence. The development journey demonstrates the importance of modular design, empirical tuning, and sustained verification in AI-assisted interfaces."
)

$doc.Add((New-ParagraphXml -Text "4.2.1 Module Description" -Style "Heading2" -KeepWithNext))
$modules = @(
    @{ Name = "Camera Capture Module"; Desc = "collects live frames from the webcam and prepares them for downstream processing"; Value = "It establishes the timing foundation of the application. If frame capture is unstable, every other module inherits that instability, so this component is responsible for basic device access, frame retrieval, and mirror preparation." },
    @{ Name = "Hand Detection Module"; Desc = "uses MediaPipe through cvzone to extract hand landmarks and confidence-aware tracking information"; Value = "This module converts raw images into structured positional data. It identifies fingertip coordinates, finger states, and relative depth values that later modules use to infer intention." },
    @{ Name = "Keyboard Rendering Module"; Desc = "draws the visual layout of keys and maintains their positions and labels"; Value = "The module acts as the visible face of the system. It ensures that interaction targets remain consistent, readable, and aligned with the hover-detection logic used in event processing." },
    @{ Name = "Gesture Validation Module"; Desc = "interprets fingertip movement and decides when a press is valid"; Value = "This component is the heart of typing accuracy. By comparing current and previous depth values and applying cooldown rules, it prevents jitter from becoming unwanted characters." },
    @{ Name = "Text Composition Module"; Desc = "builds the final output string, handles spacing and deletion, and optionally emits key events"; Value = "Its responsibility is to convert low-level press events into meaningful text. It also serves as the bridge between the virtual interface and external applications when system-level key injection is enabled." },
    @{ Name = "Prediction Module"; Desc = "searches known words and offers likely completions based on the current fragment"; Value = "This module increases typing efficiency. It reduces the number of gestures required for common words and demonstrates how a simple AI-assisted feature can significantly improve usability." },
    @{ Name = "Voice Assistant Module"; Desc = "listens for commands, performs voice typing, and speaks system responses"; Value = "The assistant makes the system multimodal and more accessible. It handles operational commands, confirmations, and conversational prompts while running in a background context." },
    @{ Name = "Persistence Module"; Desc = "loads and saves user-approved words for long-term learning"; Value = "Without persistence, the system would repeat the same learning process every session. This module gives the application memory, which is essential for personalization and future enhancement." }
)
foreach ($module in $modules) {
    Add-Paragraphs -Doc $doc -Paragraphs @(
        "$($module.Name): This module $($module.Desc). $($module.Value)",
        "$($module.Name): During integration, the module must expose outputs that are simple for neighbouring modules to consume. For that reason, the project keeps data handoffs explicit: coordinates, active keys, command text, typed output, and saved words each have a clear place in the flow.",
        "$($module.Name): The quality of the full system depends on balanced module behaviour. An over-sensitive detection module, a noisy voice module, or a weak persistence strategy can reduce trust even if the rest of the application is sound. The module-oriented design makes those trade-offs visible and correctable."
    )
}

$doc.Add((New-ParagraphXml -Text "5 SYSTEM TESTING AND IMPLEMENTATION" -Style "Heading1" -PageBreakBefore))
$doc.Add((New-ParagraphXml -Text "5.1 System Testing" -Style "Heading2" -KeepWithNext))
$tests = @(
    @{ Name = "Unit Testing"; Focus = "individual functions such as landmark extraction wrappers, hit-box checks, and file save operations" },
    @{ Name = "Integration Testing"; Focus = "interaction between camera input, gesture logic, text output, and voice threads" },
    @{ Name = "Functional Testing"; Focus = "whether each documented feature behaves as expected from the user perspective" },
    @{ Name = "Performance Testing"; Focus = "frame responsiveness, click latency, and runtime smoothness on modest hardware" },
    @{ Name = "Usability Testing"; Focus = "comfort, learnability, and clarity of interaction for first-time users" },
    @{ Name = "Stress Testing"; Focus = "longer sessions, repeated key presses, and noisy environments that challenge stability" },
    @{ Name = "Compatibility Testing"; Focus = "operation with different webcams, microphones, and Windows setups" },
    @{ Name = "Regression Testing"; Focus = "ensuring new features such as voice support do not break typing accuracy" },
    @{ Name = "Security and Privacy Review"; Focus = "safe handling of local microphone input and stored vocabulary data" },
    @{ Name = "Acceptance Testing"; Focus = "final verification against the academic project objectives and demonstration criteria" }
)
foreach ($test in $tests) {
    Add-Paragraphs -Doc $doc -Paragraphs @(
        "$($test.Name) was carried out to verify $($test.Focus). This layer of testing is necessary because the AI Virtual Keyboard is not a single algorithm but a coordinated system where small defects can quickly become user-visible failures.",
        "During $($test.Name.ToLower()), observations were recorded for both correctness and user experience. A technically valid result is not enough if the system feels inconsistent, slow, or difficult to understand. Therefore, each test outcome was interpreted from an engineering perspective and from a usability perspective.",
        "The results of $($test.Name.ToLower()) informed calibration decisions such as gesture thresholds, UI feedback intensity, and command confirmation rules. This demonstrates that testing in interactive AI systems is not only about finding faults; it is also about shaping behaviour into a stable product."
    )
}
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The consolidated testing outcome showed that the system performs best in moderate lighting with clear hand visibility and minimal background noise. Under those conditions, typing accuracy, command recognition, and text persistence meet the intended scope of a student project and a working prototype.",
    "Testing also revealed expected limitations. Extremely fast hand movement, partial hand occlusion, cluttered backgrounds, or simultaneous speech from multiple people can reduce reliability. These findings do not invalidate the design; instead, they identify the most valuable targets for future enhancement."
)

$doc.Add((New-ParagraphXml -Text "5.2 System Implementation" -Style "Heading2" -KeepWithNext))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "System implementation converts the designed architecture into an operational software package. In the AI Virtual Keyboard, implementation begins with setting up the programming environment and installing the required libraries. The camera stream is then initialized, the virtual layout is created, and the main processing loop is started.",
    "The implementation must coordinate several activities in real time. Frames are captured and processed continuously, the UI is redrawn on every cycle, typed text is maintained as state, and voice features operate asynchronously. This makes implementation discipline particularly important because blocking behaviour in one component can degrade the entire application.",
    "Another implementation concern is resource lifecycle management. The application should open and release the webcam cleanly, manage microphone sessions responsibly, and flush learned words to persistent storage without corruption. These practical details may appear small, but they are crucial for a usable and repeatable prototype.",
    "The final implementation is intended for demonstration, experimentation, and extension. It is not merely a theoretical diagram translated into code; it is a working system that can be run, observed, and improved. That practical completeness is one of the strengths of the project."
)

$doc.Add((New-ParagraphXml -Text "5.2.1 Implementation Procedures" -Style "Heading2" -KeepWithNext))
$procedures = @(
    "Install Python and all required packages such as OpenCV, cvzone, MediaPipe, SpeechRecognition, pynput, and Win32com-compatible dependencies.",
    "Connect and verify the webcam and microphone devices so the operating system exposes them correctly to the application.",
    "Create or clone the project files and keep the learned-word model file in an accessible local path.",
    "Initialize the camera capture object and configure frame size to match the expected interaction area.",
    "Define the keyboard layout through arrays or button objects so that the UI can be rendered consistently on every frame.",
    "Instantiate the hand detector and confirm that fingertip landmarks are available in live preview before enabling typing logic.",
    "Implement the hover and depth-based click validation logic, including thresholds and cooldown timing.",
    "Integrate the text composition logic so that accepted gestures update the visible output string and optional system key events.",
    "Start the background voice listener and connect command parsing to actions such as clear text, identity response, and voice mode changes.",
    "Load the learned vocabulary at startup and append user-confirmed words to the model file when the assistant approves them.",
    "Run repeated calibration sessions to tune key size, gesture sensitivity, and feedback timing for the target hardware environment.",
    "Perform end-to-end testing, document observations, correct defects, and prepare the final executable or runnable package for demonstration."
)
for ($i = 0; $i -lt $procedures.Count; $i++) {
    $stepNo = $i + 1
    Add-Paragraphs -Doc $doc -Paragraphs @(
        "Step ${stepNo}: $($procedures[$i])",
        "This step is important because implementation quality depends on sequence discipline. If developers skip validation at this point, later failures become harder to diagnose. The project therefore treats each procedure not as a checkbox but as a controlled milestone in system readiness."
    )
}

$doc.Add((New-ParagraphXml -Text "6 CONCLUSION" -Style "Heading1" -PageBreakBefore))
Add-Paragraphs -Doc $doc -Paragraphs @(
    "The AI Virtual Keyboard successfully demonstrates that touchless text entry can be achieved using affordable hardware and an intelligent software stack. By combining computer vision, geometric gesture validation, real-time rendering, and voice assistance, the project creates a practical alternative to traditional keyboard interaction in selected environments.",
    "The project's most important achievement is not simply that it detects hand movement, but that it turns that movement into a usable typing workflow. The interface acknowledges the realities of human interaction by providing visual feedback, debouncing logic, multimodal commands, and persistent personalization. These qualities elevate the system beyond a simple proof of concept.",
    "The report also confirms that effective AI projects do not always require large neural models or complex infrastructure. Carefully selected techniques, properly integrated and tested, can solve meaningful problems. The AI Virtual Keyboard is therefore a good example of applied AI engineering at project scale.",
    "At the same time, the conclusion must remain honest about limitations. Performance depends on environmental conditions, and sustained text entry is still slower than expert physical typing. Yet these limitations are acceptable within the project's aims and provide a clear roadmap for improvement. Overall, the project fulfills its academic objective and establishes a strong foundation for future development."
)

$doc.Add((New-ParagraphXml -Text "7 SUGGESTION FOR FUTURE ENHANCEMENT" -Style "Heading1" -PageBreakBefore))
$enhancements = @(
    "Future enhancement can begin with adaptive gesture calibration. Instead of using fixed thresholds for all users, the system can learn an individual user's preferred motion range and dynamically adjust press sensitivity over time.",
    "A second enhancement is multilingual support. The virtual keyboard can offer layout packs and prediction dictionaries for regional languages, technical vocabulary, or transliterated typing patterns.",
    "Another promising direction is more advanced prediction. Rather than using first-match completion, the system could rank suggestions by frequency, recent usage, or context, thereby reducing the number of gestures needed for common phrases.",
    "The project could also benefit from user profiles. Each user could maintain separate dictionaries, settings, voice preferences, and layout styles, making the software more suitable for shared devices.",
    "Noise-robust voice processing is another valuable enhancement. Offline recognition engines or push-to-talk control could reduce accidental activation and improve privacy in public environments.",
    "On the vision side, the system can be improved by incorporating hand confidence smoothing, temporal filtering, or optional depth-sensing hardware for more stable press recognition.",
    "A mobile or web-based version of the project would widen accessibility. Running the interface through a browser with camera permissions would simplify deployment and allow demonstrations without local package installation.",
    "The final long-term enhancement is integration with AR or projected interfaces. In such a scenario, the virtual keyboard could appear directly on a desk or in a head-mounted display, bringing the project closer to next-generation spatial computing."
)
Add-Paragraphs -Doc $doc -Paragraphs $enhancements

$doc.Add((New-ParagraphXml -Text "BIBLIOGRAPHY" -Style "Heading1" -PageBreakBefore))
$biblio = @(
    "1. OpenCV Documentation. Open Source Computer Vision Library. Reference for image capture, processing, and rendering operations.",
    "2. Google MediaPipe Documentation. Reference for hand landmark detection and real-time machine perception pipelines.",
    "3. cvzone Documentation and examples. Used for simplified integration of MediaPipe hand tracking into Python workflows.",
    "4. Python Official Documentation. Reference for the Python language and standard library modules such as threading, queue, and file handling.",
    "5. SpeechRecognition Library Documentation. Reference for microphone input and speech-to-text processing.",
    "6. Microsoft Speech API and Win32com references. Used for Windows text-to-speech integration in the Luna assistant.",
    "7. Research papers and articles on human computer interaction, touchless interfaces, gesture recognition, and assistive text entry systems.",
    "8. Project experimentation logs, runtime observations, and calibration notes recorded during development and testing."
)
Add-Paragraphs -Doc $doc -Paragraphs $biblio

$doc.Add((New-ParagraphXml -Text "APPENDIX" -Style "Heading1" -PageBreakBefore))
$doc.Add((New-ParagraphXml -Text "A.1 Screen Shots" -Style "Heading2" -KeepWithNext))
for ($i = 1; $i -le 30; $i++) {
    $doc.Add((New-PageBreakXml))
    Add-Paragraphs -Doc $doc -Paragraphs @(
        "Screenshot ${i}: This placeholder section documents a representative screen from the AI Virtual Keyboard workflow. In a final submitted version, the corresponding image can show stages such as application startup, hand detection, key hover state, successful key press confirmation, text prediction prompt, voice assistant response, learned word confirmation, and external application typing.",
        "The purpose of Screenshot ${i} is not limited to visual decoration. Each screenshot should provide evidence of a system state that supports the design and testing claims made in the report. Clear labels, timestamps, or short captions can help reviewers connect the interface image to the module or function under discussion."
    )
}

$doc.Add((New-ParagraphXml -Text "A.2 Sample Coding" -Style "Heading2" -KeepWithNext))
$codeIntro = @(
    "The following sample coding excerpts illustrate the style and structure of the original project. They are included for academic completeness and to help reviewers understand how the major modules map to executable logic.",
    "The samples are simplified for documentation readability. In the actual project, error handling, initialization details, and supporting utilities may appear in additional helper functions or classes."
)
Add-Paragraphs -Doc $doc -Paragraphs $codeIntro

$codeSamples = @(
    @(
        "class Button:",
        "    def __init__(self, pos, text, size=(85, 85)):",
        "        self.pos = pos",
        "        self.size = size",
        "        self.text = text"
    ),
    @(
        "cap = cv2.VideoCapture(0)",
        "cap.set(3, 1280)",
        "cap.set(4, 720)",
        "detector = HandDetector(detectionCon=0.8, maxHands=1)"
    ),
    @(
        "for button in buttonList:",
        "    x, y = button.pos",
        "    w, h = button.size",
        "    cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 255), cv2.FILLED)",
        "    cv2.putText(img, button.text, (x + 20, y + 60), cv2.FONT_HERSHEY_PLAIN, 4, (255, 255, 255), 4)"
    ),
    @(
        "if x < lmList[8][0] < x + w and y < lmList[8][1] < y + h:",
        "    current_z = lmList[8][2]",
        "    z_move = current_z - previous_z",
        "    if z_move < -15:",
        "        finger_down = True"
    ),
    @(
        "if finger_down and z_move > 15 and time.time() - last_press_time > KEY_PRESS_COOLDOWN:",
        "    finalText += button.text",
        "    keyboard.press(button.text)",
        "    keyboard.release(button.text)",
        "    last_press_time = time.time()"
    ),
    @(
        "def load_model_words(path):",
        "    if os.path.exists(path):",
        "        with open(path, 'r', encoding='utf-8') as file:",
        "            return [line.strip().upper() for line in file if line.strip()]",
        "    return []"
    ),
    @(
        "def save_word_to_model(path, word):",
        "    with open(path, 'a', encoding='utf-8') as file:",
        "        file.write(word.upper() + '\n')"
    ),
    @(
        "listener = sr.Recognizer()",
        "stop_listening = listener.listen_in_background(mic, callback_function)",
        "voice_thread = threading.Thread(target=speak_worker, daemon=True)",
        "voice_thread.start()"
    )
)

foreach ($sample in $codeSamples) {
    $doc.Add((New-PageBreakXml))
    foreach ($line in $sample) {
        $doc.Add((New-CodeParagraphXml -Text $line))
    }
    $doc.Add((New-ParagraphXml -Text "The above code segment represents one logical slice of the implementation and should be interpreted together with the surrounding state management, UI drawing, and input validation logic described earlier in the report."))
}

$doc.Add((New-ParagraphXml -Text "END OF REPORT" -Center))

$bodyXml = $doc -join "`r`n"
$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
$bodyXml
$sectPrXml
  </w:body>
</w:document>
"@

$documentPath = Join-Path $unzipPath "word\document.xml"
[System.IO.File]::WriteAllText($documentPath, $documentXml, [System.Text.Encoding]::UTF8)

if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
}

$buildRoot = Join-Path $tmpRoot "build"
New-Item -ItemType Directory -Path $buildRoot | Out-Null
Copy-Item -Path (Join-Path $unzipPath "*") -Destination $buildRoot -Recurse -Force
$outZip = Join-Path $tmpRoot "output.zip"
Compress-Archive -Path (Join-Path $buildRoot "*") -DestinationPath $outZip -Force
Copy-Item -LiteralPath $outZip -Destination $outputPath

Write-Output "Generated: $outputPath"
Write-Output ("ApproxParagraphCount: " + $doc.Count)
Write-Output ("OutputSizeBytes: " + (Get-Item -LiteralPath $outputPath).Length)

Remove-Item -LiteralPath $tmpRoot -Recurse -Force
