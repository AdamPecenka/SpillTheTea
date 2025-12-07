export const utils = {
    extractMentions(text) {
        const regex = /@([a-zA-Z0-9._-]+)/g
        const mentions = []
        
        let match
        
        while ((match = regex.exec(text)) !== null) {
            mentions.push(match[1])
        }
        
        return mentions
    }

}